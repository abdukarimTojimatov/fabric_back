const Payment = require("../models/payment");
const mongoose = require("mongoose");
const SalesOrder = require("../models/salesOrder");
const Customer = require("../models/customer");
const Wallet = require("../models/wallet");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    let payment = req.body;
    try {
      const customer = await Customer.findById(payment.customer);
      if (!customer) {
        throw new Error("Customer not found");
      }

      let remainingAmount = payment.amount;

      const salesOrders = await SalesOrder.find({
        customer: payment.customer,
        paymentStatus: { $in: ["unpaid", "partially-paid"] },
      }).sort({ createdAt: 1 });

      for (let order of salesOrders) {
        if (remainingAmount <= 0) break;

        const unpaidAmount = order.totalDebt;
        const amountToApply = Math.min(unpaidAmount, remainingAmount);

        order.totalPaid += amountToApply;
        order.totalDebt -= amountToApply;
        remainingAmount -= amountToApply;

        if (order.totalPaid == order.total_amount) {
          order.paymentStatus = "paid";
        } else {
          order.paymentStatus = "partially-paid";
        }

        await order.save();
      }

      if (remainingAmount > 0) {
        customer.customerMoney += remainingAmount;
      }
      customer.customerDebt -= payment.amount - remainingAmount;
      await customer.save();

      // Find or create the wallet
      let wallet = await Wallet.findOne({});
      if (!wallet) {
        wallet = new Wallet({
          walletCash: 0,
          walletCard: 0,
          walletBank: 0,
        });
      }

      // Update the wallet based on the payment method
      switch (payment.method) {
        case "cash":
          wallet.walletCash += payment.amount;
          break;
        case "card":
          wallet.walletCard += payment.amount;
          break;
        case "transfer":
          wallet.walletBank += payment.amount;
          break;
        default:
          throw new Error(`Invalid payment method ${payment.method}`);
      }
      await wallet.save();

      const newPayment = new Payment(req.body);
      const doc = await newPayment.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new payment", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.status(200).json(updatedPayment);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update payment", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedPayment = await Payment.findByIdAndDelete(id).exec();

      if (!deletedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.status(200).json({ message: "Payment deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete payment", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const payment = await Payment.findById(id)
        .populate({
          path: "customer",
          select: "name",
          model: "Customer",
        })
        .exec();

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.status(200).json(payment);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find payment", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search, method, customer, dateFrom, dateTo } =
        req.body;
      let query = {};

      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      if (method) {
        query.method = method;
      }

      if (customer) {
        query.customer = customer;
      }

      if (dateFrom && dateTo) {
        query["date"] = {
          $gte: `${dateFrom} 00:00:00`,
          $lte: `${dateTo} 23:59:00`,
        };
      }

      if (!page || !limit) {
        let payments = await Payment.find(query)
          .populate({
            path: "customer",
            select: "name",
            model: "Customer",
          })
          .populate({
            path: "salesOrderId",
            select: "autoNumber",
            model: "SalesOrder",
          })
          .exec();
        res.status(200).json(payments);
      }

      const options = {
        limit: parseInt(limit) || 10,
        page: parseInt(page) || 1,
        populate: [
          {
            path: "customer",
            select: "name",
            model: "Customer",
          },
          {
            path: "salesOrderId",
            select: "autoNumber",
            model: "SalesOrder",
          },
        ],
      };

      const payments = await Payment.paginate(query, options);

      res.status(200).json(payments);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find payments", err.message));
    }
  },
};
