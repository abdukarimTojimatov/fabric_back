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
      const { limit, page, search } = req.body;
      let query = {};
      if (search) {
        query["description"] = { $regex: new RegExp(search, "i") };
      }
      let expences;
      if (!limit || !page) {
        expences = await Expences.find(query)
          .populate({
            path: "category",
            select: "name",
            model: "ExpenseCategory",
            strictPopulate: false,
          })
          .exec();
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };
        let paginatedResult = await Expences.paginate(query, options);

        expences = await Expences.populate(paginatedResult.docs, {
          path: "category",
          select: "name",
          model: "ExpenseCategory",
          strictPopulate: false,
        });

        paginatedResult.docs = expences;
        expences = paginatedResult;
      }

      res.status(200).json(expences);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find expenses", err.message));
    }
  },
};
