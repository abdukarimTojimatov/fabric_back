const SalesOrder = require("../models/salesOrder");
const SalesOrderItem = require("../models/salesOrderItem");
const Product = require("../models/product");
const StockProduct = require("../models/stockProduct");
const Payment = require("../models/payment");
const { ErrorHandler } = require("../util/error");
const supplier = require("./supplier");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const {
        customer,
        payments,
        customerType,
        shippingAddress,
        orderNotes,
        autoNumber,
        tax,
        status,
        items,
      } = req.body;
      const user = req.user._id;

      const salesOrder = new SalesOrder({
        customer,
        customerType,
        shippingAddress,
        orderNotes,
        autoNumber,
        tax,
        status,
        user,
      });

      const itemPromises = items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product with ID ${item.product} not found`);
        }

        const total_amount = item.quantity * product.product_sellingPrice;
        const total_origin_amount = item.quantity * product.product_originPrice;
        const total_income_amount = total_amount - total_origin_amount;

        const stockProduct = await StockProduct.findOne({
          product: item.product,
        });
        if (!stockProduct) {
          throw new Error(
            `Stock for product with ID ${item.product} not found`
          );
        }

        if (stockProduct.quantityInStock < item.quantity) {
          throw new Error(
            `Not enough quantity in stock for product with ID ${item.product}`
          );
        }
        stockProduct.quantityInStock -= item.quantity;
        await stockProduct.save();

        const salesOrderItem = new SalesOrderItem({
          customer: salesOrder.customer,
          product: item.product,
          salesOrder: salesOrder._id,
          quantity: item.quantity,
          unitOfMeasurement: product.unitOfMeasurement,
          total_amount,
          total_origin_amount,
          total_income_amount,
          subtotal: total_amount,
        });

        await salesOrderItem.save();
        return salesOrderItem;
      });

      const savedSalesOrderItems = await Promise.all(itemPromises);

      let totalSalesOrderAmount = 0;
      let totalSalesOrderOriginAmount = 0;
      let totalSalesOrderIncomeAmount = 0;

      savedSalesOrderItems.forEach((salesOrderItem) => {
        totalSalesOrderAmount += salesOrderItem.total_amount;
        totalSalesOrderOriginAmount += salesOrderItem.total_origin_amount;
        totalSalesOrderIncomeAmount += salesOrderItem.total_income_amount;
      });

      salesOrder.total_amount = totalSalesOrderAmount;
      salesOrder.total_origin_amount = totalSalesOrderOriginAmount;
      salesOrder.total_income_amount = totalSalesOrderIncomeAmount;
      salesOrder.totalDebt = totalSalesOrderAmount;
      salesOrder.totalPaid = 0;
      salesOrder.paymentStatus = "unpaid";

      await salesOrder.save();

      // Create initial payment entries if any payments are provided
      if (payments && payments.length > 0) {
        const paymentPromises = payments.map(async (payment) => {
          const newPayment = new Payment({
            salesOrderId: salesOrder._id,
            amount: payment.amount,
            method: payment.method,
          });
          await newPayment.save();
          return newPayment;
        });

        const savedPayments = await Promise.all(paymentPromises);

        const totalPaid = savedPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        salesOrder.totalPaid = totalPaid;
        salesOrder.totalDebt = totalSalesOrderAmount - totalPaid;

        if (salesOrder.totalDebt === 0) {
          salesOrder.paymentStatus = "paid";
        } else if (salesOrder.totalPaid > 0) {
          salesOrder.paymentStatus = "partially-paid";
        }

        await salesOrder.save();
      }

      res
        .status(201)
        .json({ message: "Sales order created successfully", salesOrder });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new order", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedOrder = await SalesOrder.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(updatedOrder);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update order", err.message));
    }
  },

  updatePayment: async function (req, res, next) {
    try {
      const orderId = req.params.id;
      const paymentsData = req.body;

      if (!Array.isArray(paymentsData)) {
        return res.status(400).json({ error: "Invalid payment data" });
      }

      const order = await SalesOrder.findById(orderId).exec();
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const totalAmountToPay = paymentsData.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      if (totalAmountToPay > order.totalDebt) {
        return res.status(400).json({
          error:
            "Mijoz ko'p pul to'lamoqda, iltimos faqatgina qarzga teng bo'lgan pul miqdorini kiriting",
        });
      }

      // Save each payment
      for (let paymentData of paymentsData) {
        const { amount, method } = paymentData;
        const payment = new Payment({ salesOrderId: orderId, amount, method });
        await payment.save();
      }

      const payments = await Payment.find({ salesOrderId: orderId });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      order.totalPaid = totalPaid;
      order.totalDebt = order.total_amount - totalPaid;

      if (order.totalDebt === 0) {
        order.paymentStatus = "paid";
      } else if (order.totalPaid === 0) {
        order.paymentStatus = "pending";
      } else if (order.totalPaid < order.total_amount) {
        order.paymentStatus = "partially-paid";
      } else {
        order.paymentStatus = "pending";
      }

      await order.save();

      res.status(200).json({ message: "Payment updated successfully", order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedOrder = await SalesOrder.findByIdAndDelete(id).exec();

      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      await Payment.deleteMany({ salesOrderId: id });

      res
        .status(200)
        .json({ message: "Order and related payments deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete order", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;

      const order = await SalesOrder.findById(id)
        .populate({
          path: "customer",
          select: "name",
          model: "Customer",
          strictPopulate: false,
        })
        .populate({
          path: "user",
          select: "username",
          model: "User",
          strictPopulate: false,
        })
        .exec();

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const payments = await Payment.find({ salesOrderId: id });

      const salesItems = await SalesOrderItem.find({ salesOrder: id }).populate(
        {
          path: "product",
          select: "name",
          model: "Product",
          strictPopulate: false,
        }
      );
      //
      res.status(200).json({ order, payments, salesItems });
      //
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find order", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search, customer, dateFrom, dateTo, user } =
        req.body;
      let query = {};

      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      if (customer) {
        query.customer = customer;
      }

      if (user) {
        query.user = user;
      }
      let salesOrders;

      const parseDate = (dateString) => {
        const [year, month, day] = dateString.split(":").map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      };

      if (dateFrom && dateTo) {
        const fromDate = parseDate(dateFrom);
        const toDate = parseDate(dateTo);
        query.createdAt = { $gte: fromDate, $lte: toDate };
      } else if (dateFrom) {
        const date = parseDate(dateFrom);
        const nextDate = new Date(date);
        nextDate.setUTCDate(date.getUTCDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDate };
      }
      if (!page || !limit) {
        salesOrders = await SalesOrder.find(query)
          .populate({
            path: "customer",
            select: "name",
            model: "Customer",
          })
          .populate({
            path: "user",
            select: "username",
            model: "User",
          });
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
          populate: [
            {
              path: "customer",
              select: "name",
              model: "Customer",
            },
            {
              path: "user",
              select: "username",
              model: "User",
            },
          ],
        };

        salesOrders = await SalesOrder.paginate(query, options);
      }

      res.status(200).json(salesOrders);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },

  reportDaily: async function (req, res, next) {
    try {
      const { limit, page, search, customer, dateFrom, dateTo, user } =
        req.body;
      let query = {};

      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      if (customer) {
        query.customer = customer;
      }

      if (user) {
        query.user = user;
      }
      let salesOrders;

      const parseDate = (dateString) => {
        const [year, month, day] = dateString.split(":").map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      };

      if (dateFrom && dateTo) {
        const fromDate = parseDate(dateFrom);
        const toDate = parseDate(dateTo);
        query.createdAt = { $gte: fromDate, $lte: toDate };
      } else if (dateFrom) {
        const date = parseDate(dateFrom);
        const nextDate = new Date(date);
        nextDate.setUTCDate(date.getUTCDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDate };
      }
      if (!page || !limit) {
        salesOrders = await SalesOrder.find(query)
          .populate({
            path: "customer",
            select: "name",
            model: "Customer",
          })
          .populate({
            path: "user",
            select: "username",
            model: "User",
          });
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
          populate: [
            {
              path: "customer",
              select: "name",
              model: "Customer",
            },
            {
              path: "user",
              select: "username",
              model: "User",
            },
          ],
        };

        salesOrders = await SalesOrder.paginate(query, options);
      }

      res.status(200).json(salesOrders);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },
};
