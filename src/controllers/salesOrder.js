const SalesOrder = require("../models/salesOrder");
const SalesOrderItem = require("../models/salesOrderItem");
const Product = require("../models/product");
const StockProduct = require("../models/stockProduct");
const Payment = require("../models/payment");
const Customer = require("../models/customer");
const { ErrorHandler } = require("../util/error");
const mongoose = require("mongoose");
module.exports = {
  addNew: async function (req, res, next) {
    try {
      const { customer, payments, shippingAddress, orderNotes, items } =
        req.body;
      const user = req.user._id;

      const salesOrder = new SalesOrder({
        customer,
        shippingAddress,
        orderNotes,
        user,
      });

      const itemPromises = items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Bizda bunday ${product.name} mahsulot mavjud emas `);
        }

        const total_amount = item.quantity * product.product_sellingPrice;
        const total_origin_amount = item.quantity * product.product_originPrice;
        const total_income_amount = total_amount - total_origin_amount;

        const stockProduct = await StockProduct.findOne({
          product: item.product,
        });
        if (!stockProduct) {
          throw new Error(
            `Ushbu ${product.name} mahsulotdan omborda mavjud emas `
          );
        }

        if (stockProduct.quantityInStock < item.quantity) {
          throw new Error(
            `Ushbu ${product.name} mahsulotdan omborda yetarli emas `
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

      let remainingDebt = totalSalesOrderAmount;
      let amountFromCustomerMoney = 0;
      const customerObj = await Customer.findById(customer);

      if (!customerObj) {
        throw new Error(` Bizda bunday ${customer.name} mijoz mavjud emas `);
      }

      // Apply payments first
      let totalPaid = 0;
      if (payments && payments.length > 0) {
        const paymentPromises = payments.map(async (payment) => {
          const newPayment = new Payment({
            salesOrderId: salesOrder._id,
            amount: payment.amount,
            method: payment.method,
            customer: salesOrder.customer,
          });
          await newPayment.save();
          return newPayment;
        });

        const savedPayments = await Promise.all(paymentPromises);

        totalPaid = savedPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        if (totalPaid > totalSalesOrderAmount) {
          throw new Error(
            ` Siz ${
              totalPaid - totalSalesOrderAmount
            } so'm keragidan ortiq mablag' to'lamoqdasiz, `
          );
        }

        remainingDebt -= totalPaid;
      }

      // Use customerMoney to cover remaining debt
      if (remainingDebt > 0 && customerObj.customerMoney > 0) {
        const amountToApply = Math.min(
          customerObj.customerMoney,
          remainingDebt
        );
        remainingDebt -= amountToApply;
        customerObj.customerMoney -= amountToApply;
        amountFromCustomerMoney = amountToApply;
      }

      salesOrder.totalDebt = remainingDebt;
      salesOrder.totalPaid = totalPaid + amountFromCustomerMoney;
      salesOrder.amountFromCustomerMoney = amountFromCustomerMoney;

      if (salesOrder.totalDebt === 0) {
        salesOrder.paymentStatus = "paid";
      } else if (salesOrder.totalPaid > 0) {
        salesOrder.paymentStatus = "partially-paid";
      } else if (salesOrder.totalPaid === 0) {
        salesOrder.paymentStatus = "unpaid";
      }

      await salesOrder.save();

      // Update customer's debt
      customerObj.customerDebt += remainingDebt;
      await customerObj.save();

      res.status(201).json({ salesOrder });
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

      const customerObj = await Customer.findById(order.customer);
      if (!customerObj) {
        throw new Error(`Customer with ID ${order.customer} not found`);
      }
      customerObj.customerDebt -= totalAmountToPay;
      await customerObj.save();

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
      const { limit, page, search, status, customer, dateFrom, dateTo, user } =
        req.body;
      let query = {};

      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      if (customer) {
        query.customer = customer;
      }

      if (status) {
        query.paymentStatus = status;
      }

      if (user) {
        query.user = user;
      }
      let salesOrders;

      function parseDate(dateString, endOfDay = false) {
        const [year, month, day] = dateString.split(":");
        if (endOfDay) {
          return new Date(`${year}-${month}-${day}T23:59:59.999Z`);
        }
        return new Date(`${year}-${month}-${day}T00:00:00Z`);
      }

      if (dateFrom && dateTo) {
        const fromDate = parseDate(dateFrom);
        const toDate = parseDate(dateTo, true);
        query.createdAt = { $gte: fromDate, $lte: toDate };
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
        if (customer) {
          query.customer = new mongoose.Types.ObjectId(customer);
        }
        if (user) {
          query.user = new mongoose.Types.ObjectId(user);
        }

        const totalQuantityResult = await SalesOrder.aggregate([
          { $match: query },
          {
            $lookup: {
              from: "payments",
              localField: "_id",
              foreignField: "salesOrderId",
              as: "payments",
            },
          },
          {
            $group: {
              _id: "$_id",
              total_amount: { $first: "$total_amount" },
              total_origin_amount: { $first: "$total_origin_amount" },
              total_income_amount: { $first: "$total_income_amount" },
              totalDebt: { $first: "$totalDebt" },
              totalPaid: { $first: "$totalPaid" },
              totalCash: {
                $sum: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$payments",
                          as: "payment",
                          cond: { $eq: ["$$payment.method", "cash"] },
                        },
                      },
                      as: "payment",
                      in: "$$payment.amount",
                    },
                  },
                },
              },
              totalCard: {
                $sum: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$payments",
                          as: "payment",
                          cond: { $eq: ["$$payment.method", "card"] },
                        },
                      },
                      as: "payment",
                      in: "$$payment.amount",
                    },
                  },
                },
              },
              totalTransfer: {
                $sum: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$payments",
                          as: "payment",
                          cond: { $eq: ["$$payment.method", "transfer"] },
                        },
                      },
                      as: "payment",
                      in: "$$payment.amount",
                    },
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              total_amount: { $sum: "$total_amount" },
              total_origin_amount: { $sum: "$total_origin_amount" },
              total_income_amount: { $sum: "$total_income_amount" },
              totalDebt: { $sum: "$totalDebt" },
              totalPaid: { $sum: "$totalPaid" },
              totalCash: { $sum: "$totalCash" },
              totalCard: { $sum: "$totalCard" },
              totalTransfer: { $sum: "$totalTransfer" },
            },
          },
        ]);
        console.log(totalQuantityResult);
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

        if (totalQuantityResult.length > 0) {
          salesOrders.totalAmount = totalQuantityResult[0].total_amount;
          salesOrders.totalOriginAmount =
            totalQuantityResult[0].total_origin_amount;
          salesOrders.totalIncomeAmount =
            totalQuantityResult[0].total_income_amount;
          salesOrders.totalDebt = totalQuantityResult[0].totalDebt;
          salesOrders.totalPaid = totalQuantityResult[0].totalPaid;
          salesOrders.totalCash = totalQuantityResult[0].totalCash;
          salesOrders.totalCard = totalQuantityResult[0].totalCard;
          salesOrders.totalTransfer = totalQuantityResult[0].totalTransfer;
        }
      }

      res.status(200).json(salesOrders);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },
};
