const ExpenseCategory = require("../models/expenceCategory");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const newExpenseCategory = new ExpenseCategory(req.body);
      const doc = await newExpenseCategory.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to add new expense category", err.message)
      );
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedExpenseCategory = await ExpenseCategory.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).exec();

      if (!updatedExpenseCategory) {
        return res.status(404).json({ message: "Expense category not found" });
      }

      res.status(200).json(updatedExpenseCategory);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to update expense category", err.message)
      );
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedExpenseCategory = await ExpenseCategory.findByIdAndDelete(
        id
      ).exec();

      if (!deletedExpenseCategory) {
        return res.status(404).json({ message: "Expense category not found" });
      }

      res
        .status(200)
        .json({ message: "Expense category deleted successfully" });
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to delete expense category", err.message)
      );
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const expenseCategory = await ExpenseCategory.findById(id).exec();

      if (!expenseCategory) {
        return res.status(404).json({ message: "Expense category not found" });
      }

      res.status(200).json(expenseCategory);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to find expense category", err.message)
      );
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search } = req.body;
      let query = {};
      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }
      let categories;
      if (!limit || !page) {
        categories = await ExpenseCategory.find(query).exec();
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };
        categories = await ExpenseCategory.paginate(query, options);
      }

      res.status(200).json(categories);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to find expense categories", err.message)
      );
    }
  },
};
