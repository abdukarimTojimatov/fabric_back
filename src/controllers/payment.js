const Payment = require("../models/payment");
const mongoose = require("mongoose");
const SalesOrder = require("../models/salesOrder");
const Customer = require("../models/customer");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    let payment = req.body;
    try {
      const customer = await Customer.findById(payment.customer).session(
        session
      );
      if (!customer) {
        throw new Error("Customer not found");
      }

      let remainingAmount = payment.amount;

      const salesOrders = await SalesOrder.find({
        customer: payment.customer,
        paymentStatus: { $in: ["unpaid", "partially-paid"] },
      })
        .sort({ createdAt: 1 })
        .session(session);

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

        await order.save({ session });
      }
      if (remainingAmount > 0) {
        customer.customerMoney += remainingAmount;
      }
      customer.customerDebt -= payment.amount - remainingAmount;
      await customer.save({ session });

      await session.commitTransaction();
      session.endSession();

      const newPayment = new Payment(req.body);
      const doc = await newPayment.save();
      res.status(201).json(doc);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
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
      const payment = await Payment.findById(id).exec();

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
      const payments = await Payment.find().exec();
      res.status(200).json(payments);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find payments", err.message));
    }
  },
};
