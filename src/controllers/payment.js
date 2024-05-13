const Payment = require("../models/payment");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
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
