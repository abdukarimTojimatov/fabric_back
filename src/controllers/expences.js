const Expences = require("../models/expences");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const newExpense = new Expences(req.body);
      const doc = await newExpense.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new expense", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedExpense = await Expences.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json(updatedExpense);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update expense", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedExpense = await Expences.findByIdAndDelete(id).exec();

      if (!deletedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete expense", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const expense = await Expences.findById(id).exec();

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json(expense);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find expense", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const expenses = await Expences.find().exec();
      res.status(200).json(expenses);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find expenses", err.message));
    }
  },
};
