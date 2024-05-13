const CustomerDebt = require("../models/customerDebt");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const newCustomerDebt = new CustomerDebt(req.body);
      const doc = await newCustomerDebt.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to add new customer debt", err.message)
      );
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedCustomerDebt = await CustomerDebt.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).exec();

      if (!updatedCustomerDebt) {
        return res.status(404).json({ message: "Customer debt not found" });
      }

      res.status(200).json(updatedCustomerDebt);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to update customer debt", err.message)
      );
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedCustomerDebt = await CustomerDebt.findByIdAndDelete(
        id
      ).exec();

      if (!deletedCustomerDebt) {
        return res.status(404).json({ message: "Customer debt not found" });
      }

      res.status(200).json({ message: "Customer debt deleted successfully" });
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to delete customer debt", err.message)
      );
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const customerDebt = await CustomerDebt.findById(id).exec();

      if (!customerDebt) {
        return res.status(404).json({ message: "Customer debt not found" });
      }

      res.status(200).json(customerDebt);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find customer debt", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const customerDebts = await CustomerDebt.find().exec();
      res.status(200).json(customerDebts);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find customer debts", err.message));
    }
  },
};
