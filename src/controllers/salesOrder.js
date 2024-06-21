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
      const {
        customer,
        payments,
        shippingAddress,
        oneUSDCurrency,
        shippingCost,
        orderNotes,
        items,
      } = req.body;
      const user = req.user._id;

      // Create a new SalesOrder instance
      const salesOrder = new SalesOrder({
        customer,
        shippingAddress,
        orderNotes,
        oneUSDCurrency,
        shippingCost,
        user,
      });

      // Process each item in the order
      const itemPromises = items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        const total_amount = item.quantity * item.product_sellingPrice;
        const total_amountOnUSD =
          item.quantity * item.product_sellingPriceOnUSD;
        const total_origin_amount = item.quantity * product.product_originPrice;
        const total_income_amount = total_amount - total_origin_amount;

        // Find stock for the product
        const stockProduct = await StockProduct.findOne({
          product: item.product,
        });
        if (!stockProduct) {
          throw new Error(`Stock for product ${product.name} not found`);
        }

        // Check if there is enough stock
        if (stockProduct.quantityInStock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.name}`);
        }

        // Reduce the stock quantity
        stockProduct.quantityInStock -= item.quantity;
        await stockProduct.save();

        // Create a new SalesOrderItem instance
        const salesOrderItem = new SalesOrderItem({
          customer: salesOrder.customer,
          product: item.product,
          salesOrder: salesOrder._id,
          product_sellingPrice: item.product_sellingPrice,
          product_sellingPriceOnUSD: item.product_sellingPriceOnUSD,
          quantity: item.quantity,
          unitOfMeasurement: product.unitOfMeasurement,
          total_amount,
          total_origin_amount,
          total_amountOnUSD,
          total_income_amount,
          oneUSDCurrency,
          subtotal: total_amount,
        });

        await salesOrderItem.save();
        return salesOrderItem;
      });

      // Wait for all items to be processed
      const savedSalesOrderItems = await Promise.all(itemPromises);

      // Calculate totals for the sales order
      let totalSalesOrderAmount = 0;
      let totalSalesOrderOriginAmount = 0;
      let totalSalesOrderIncomeAmount = 0;
      let totalSalesOrderOnUSDAmount = 0;

      savedSalesOrderItems.forEach((salesOrderItem) => {
        totalSalesOrderAmount += salesOrderItem.total_amount;
        totalSalesOrderOnUSDAmount += salesOrderItem.total_amountOnUSD;
        totalSalesOrderOriginAmount += salesOrderItem.total_origin_amount;
        totalSalesOrderIncomeAmount += salesOrderItem.total_income_amount;
      });

      const total_amountWithShippingCost = totalSalesOrderAmount + shippingCost;

      // Set totals in the sales order
      salesOrder.total_amount = totalSalesOrderAmount;
      salesOrder.total_amountWithShippingCost = total_amountWithShippingCost;
      salesOrder.total_origin_amount = totalSalesOrderOriginAmount;
      salesOrder.total_income_amount = totalSalesOrderIncomeAmount;
      salesOrder.total_onUSD_amount = totalSalesOrderOnUSDAmount;

      let remainingDebt = totalSalesOrderAmount;
      let amountFromCustomerMoney = 0;
      const customerObj = await Customer.findById(customer);

      if (!customerObj) {
        throw new Error(`Customer ${customer} not found`);
      }

      // Process payments
      let totalPaid = 0;
      if (payments && payments.length > 0) {
        const paymentPromises = payments.map(async (payment) => {
          const newPayment = new Payment({
            salesOrderId: salesOrder._id,
            amount: payment.amount,
            method: payment.method,
            amountOnUSD: payment.amountOnUSD,
            customer: salesOrder.customer,
            oneUSDCurrency: oneUSDCurrency,
          });
          await newPayment.save();
          return newPayment;
        });

        const savedPayments = await Promise.all(paymentPromises);

        // Calculate total paid amount
        totalPaid = savedPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        // Handle overpayment by adding excess to customerMoney
        if (totalPaid > totalSalesOrderAmount) {
          const excessPayment = totalPaid - totalSalesOrderAmount;
          customerObj.customerMoney += excessPayment;
          totalPaid = totalSalesOrderAmount;
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

      // Set payment details in the sales order
      salesOrder.totalDebt = remainingDebt;
      salesOrder.totalPaid = totalPaid + amountFromCustomerMoney;
      salesOrder.amountFromCustomerMoney = amountFromCustomerMoney;

      // Determine payment status
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
      const updatedOrderData = req.body;

      // Fetch the original order before update
      const originalOrder = await SalesOrder.findById(id).exec();
      if (!originalOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Update the SalesOrder
      const updatedOrder = await SalesOrder.findByIdAndUpdate(
        id,
        updatedOrderData,
        {
          new: true,
        }
      ).exec();

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check for changes in the items and update SalesOrderItems accordingly
      const itemPromises = updatedOrderData.items.map(async (item) => {
        const salesOrderItem = await SalesOrderItem.findOne({
          salesOrder: id,
          product: item.product,
        }).exec();

        if (salesOrderItem) {
          const product = await Product.findById(item.product);
          if (!product) {
            throw new Error(`Product ${item.product} not found`);
          }

          // Update sales order item with new details
          salesOrderItem.quantity = item.quantity;
          salesOrderItem.product_sellingPrice = item.product_sellingPrice;
          salesOrderItem.product_sellingPriceOnUSD =
            item.product_sellingPriceOnUSD;

          const total_amount = item.quantity * item.product_sellingPrice;
          const total_amountOnUSD =
            item.quantity * item.product_sellingPriceOnUSD;
          const total_origin_amount =
            item.quantity * product.product_originPrice;
          const total_income_amount = total_amount - total_origin_amount;

          salesOrderItem.total_amount = total_amount;
          salesOrderItem.total_amountOnUSD = total_amountOnUSD;
          salesOrderItem.total_origin_amount = total_origin_amount;
          salesOrderItem.total_income_amount = total_income_amount;

          await salesOrderItem.save();
        } else {
          throw new Error(
            `Sales order item for product ${item.product} not found`
          );
        }
      });

      await Promise.all(itemPromises);

      // Recalculate total amounts for the SalesOrder
      const savedSalesOrderItems = await SalesOrderItem.find({
        salesOrder: id,
      });
      let totalSalesOrderAmount = 0;
      let totalSalesOrderOriginAmount = 0;
      let totalSalesOrderIncomeAmount = 0;
      let totalSalesOrderOnUSDAmount = 0;

      savedSalesOrderItems.forEach((salesOrderItem) => {
        totalSalesOrderAmount += salesOrderItem.total_amount;
        totalSalesOrderOnUSDAmount += salesOrderItem.total_amountOnUSD;
        totalSalesOrderOriginAmount += salesOrderItem.total_origin_amount;
        totalSalesOrderIncomeAmount += salesOrderItem.total_income_amount;
      });

      const total_amountWithShippingCost =
        totalSalesOrderAmount + updatedOrder.shippingCost;

      // Update the SalesOrder with the recalculated totals
      updatedOrder.total_amount = totalSalesOrderAmount;
      updatedOrder.total_amountWithShippingCost = total_amountWithShippingCost;
      updatedOrder.total_origin_amount = totalSalesOrderOriginAmount;
      updatedOrder.total_income_amount = totalSalesOrderIncomeAmount;
      updatedOrder.total_onUSD_amount = totalSalesOrderOnUSDAmount;

      // Update payment details and customer debt
      const customerObj = await Customer.findById(updatedOrder.customer);
      if (!customerObj) {
        throw new Error(`Customer with ID ${updatedOrder.customer} not found`);
      }

      // Calculate total amount paid from the associated payments
      const totalPaidResult = await Payment.aggregate([
        { $match: { salesOrderId: id } },
        { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
      ]).exec();

      const totalPaidAmount =
        totalPaidResult.length > 0 ? totalPaidResult[0].totalPaid : 0;
      let remainingDebt = updatedOrder.total_amount - totalPaidAmount;

      // Handle overpayment by adding excess to customerMoney
      if (totalPaidAmount > updatedOrder.total_amount) {
        const excessPayment = totalPaidAmount - updatedOrder.total_amount;
        customerObj.customerMoney += excessPayment;
        remainingDebt = 0; // Set remaining debt to zero as it's fully paid
      }

      // Adjust customer debt and save changes
      customerObj.customerDebt += remainingDebt - originalOrder.totalDebt;
      await customerObj.save();

      updatedOrder.totalPaid = totalPaidAmount;
      updatedOrder.totalDebt = remainingDebt;

      // Determine payment status
      if (updatedOrder.totalDebt === 0) {
        updatedOrder.paymentStatus = "paid";
      } else if (updatedOrder.totalPaid === 0) {
        updatedOrder.paymentStatus = "unpaid";
      } else if (updatedOrder.totalPaid < updatedOrder.total_amount) {
        updatedOrder.paymentStatus = "partially-paid";
      }

      await updatedOrder.save();

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

      // Ensure paymentsData is an array
      if (!Array.isArray(paymentsData)) {
        return res.status(400).json({ error: "Invalid payment data" });
      }

      // Find the sales order by ID
      const order = await SalesOrder.findById(orderId).exec();
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Calculate the total amount to pay from the provided payments
      const totalAmountToPay = paymentsData.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      // Fetch the customer object
      const customerObj = await Customer.findById(order.customer);
      if (!customerObj) {
        throw new Error(`Customer with ID ${order.customer} not found`);
      }

      // Check if the total amount to pay exceeds the total debt
      if (totalAmountToPay > order.totalDebt) {
        const excessPayment = totalAmountToPay - order.totalDebt;
        customerObj.customerMoney += excessPayment;

        // Update the total amount to pay to only cover the debt
        totalAmountToPay = order.totalDebt;
      }

      // Save each payment
      for (let paymentData of paymentsData) {
        const { amount, method } = paymentData;
        const payment = new Payment({
          salesOrderId: orderId,
          amount,
          method,
          customer: order.customer,
          oneUSDCurrency: order.oneUSDCurrency,
        });
        await payment.save();
      }

      // Fetch all payments for the order
      const payments = await Payment.find({ salesOrderId: orderId });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      // Update order payment details
      order.totalPaid = totalPaid;
      order.totalDebt = order.total_amount - totalPaid;

      // Determine payment status
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

      // Update the customer's debt
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
          return `${year}-${month}-${day}-23:59`;
        }
        return `${year}-${month}-${day}-00:00`;
      }

      if (dateFrom && dateTo) {
        const fromDate = parseDate(dateFrom);
        const toDate = parseDate(dateTo, true);
        query.date = { $gte: fromDate, $lte: toDate };
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
