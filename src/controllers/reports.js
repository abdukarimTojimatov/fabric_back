const SalesOrder = require("../models/salesOrder");
const SalesOrderItem = require("../models/salesOrderItem");
const Product = require("../models/product");
const Salary = require("../models/salary");
const ExpenseSchema = require("../models/expences");

const { ErrorHandler } = require("../util/error");

module.exports = {
  daysInMonth: async function (req, res, next) {
    try {
      const { year, month } = req.body;

      const startDate = `${year}-${String(month).padStart(2, "0")}-01-00:00`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(
        year,
        month,
        0
      ).getDate()}-23:59`;

      const totalSales = await SalesOrder.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $substr: ["$date", 0, 4] },
              month: { $substr: ["$date", 5, 2] },
              day: { $substr: ["$date", 8, 2] },
            },
            total_amount: { $sum: "$total_amount" },
            total_origin_amount: { $sum: "$total_origin_amount" },
            total_income_amount: { $sum: "$total_income_amount" },
            totalDebt: { $sum: "$totalDebt" },
            totalPaid: { $sum: "$totalPaid" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ]);

      if (totalSales.length === 0) {
        return res.status(200).json([]);
      }

      res.status(200).json(totalSales);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },

  monthsInYear: async function (req, res, next) {
    try {
      const { year } = req.body;

      const startDate = `${year}-01-01-00:00`;
      const endDate = `${year}-12-31-23:59`;

      const totalMonthlySales = await SalesOrder.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $substr: ["$date", 5, 2] } },
            total_amount: { $sum: "$total_amount" },
            total_origin_amount: { $sum: "$total_origin_amount" },
            total_income_amount: { $sum: "$total_income_amount" },
            totalDebt: { $sum: "$totalDebt" },
            totalPaid: { $sum: "$totalPaid" },
            total_onUSD_amount: { $sum: "$total_onUSD_amount" },
            shippingCost: { $sum: "$shippingCost" },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

      const totalMonthlyExpenses = await ExpenseSchema.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $substr: ["$date", 5, 2] } },
            total_expenses: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

      const totalMonthlySalaries = await Salary.aggregate([
        {
          $match: {
            year: parseInt(year, 10),
          },
        },
        {
          $group: {
            _id: { month: "$month" },
            total_salaries: { $sum: "$totalSalary" },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

      const months = Array.from({ length: 12 }, (_, i) => i + 1);

      const mergedResults = months.map((month) => {
        const sale = totalMonthlySales.find(
          (s) => s._id.month === String(month).padStart(2, "0")
        ) || {
          total_amount: 0,
          total_origin_amount: 0,
          total_income_amount: 0,
          totalDebt: 0,
          totalPaid: 0,
          total_onUSD_amount: 0,
          shippingCost: 0,
        };
        const expense = totalMonthlyExpenses.find(
          (e) => e._id.month === String(month).padStart(2, "0")
        ) || {
          total_expenses: 0,
        };
        const salary = totalMonthlySalaries.find(
          (s) => s._id.month === month
        ) || {
          total_salaries: 0,
        };

        return {
          month: month,
          total_amount: sale.total_amount,
          total_origin_amount: sale.total_origin_amount,
          total_income_amount: sale.total_income_amount,
          total_onUSD_amount: sale.total_onUSD_amount,
          totalDebt: sale.totalDebt,
          totalPaid: sale.totalPaid,
          totalShippingCost: sale.shippingCost,
          total_expenses: expense.total_expenses,
          total_salaries: salary.total_salaries,
          total_revenue:
            sale.total_income_amount -
            expense.total_expenses -
            salary.total_salaries,
        };
      });

      res.status(200).json(mergedResults);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },

  allYears: async function (req, res, next) {
    try {
      const { startYear, endYear } = req.body;

      const yearlySales = await SalesOrder.aggregate([
        {
          $match: {
            date: {
              $gte: `${startYear}-01-01-00:00`,
              $lte: `${endYear}-12-31-23:59`,
            },
          },
        },
        {
          $group: {
            _id: { year: { $substr: ["$date", 0, 4] } },
            total_amount: { $sum: "$total_amount" },
            total_origin_amount: { $sum: "$total_origin_amount" },
            total_income_amount: { $sum: "$total_income_amount" },
            totalDebt: { $sum: "$totalDebt" },
            totalPaid: { $sum: "$totalPaid" },
            total_onUSD_amount: { $sum: "$total_onUSD_amount" },
            totalShippingCost: { $sum: "$shippingCost" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
          },
        },
      ]);

      const yearlyExpenses = await ExpenseSchema.aggregate([
        {
          $match: {
            date: {
              $gte: `${startYear}-01-01-00:00`,
              $lte: `${endYear}-12-31-23:59`,
            },
          },
        },
        {
          $group: {
            _id: { year: { $substr: ["$date", 0, 4] } },
            total_expenses: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
          },
        },
      ]);

      const yearlySalaries = await Salary.aggregate([
        {
          $match: {
            year: {
              $gte: parseInt(startYear, 10),
              $lte: parseInt(endYear, 10),
            },
          },
        },
        {
          $group: {
            _id: { year: "$year" },
            total_salaries: { $sum: "$totalSalary" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
          },
        },
      ]);

      const mergedResults = yearlySales.map((sale) => {
        const year = sale._id.year;

        const expense = yearlyExpenses.find((exp) => exp._id.year === year) || {
          total_expenses: 0,
        };
        const salary = yearlySalaries.find((sal) => sal._id.year === year) || {
          total_salaries: 0,
        };

        return {
          year: year,
          total_amount: sale.total_amount,
          total_origin_amount: sale.total_origin_amount,
          total_income_amount: sale.total_income_amount,
          totalDebt: sale.totalDebt,
          totalPaid: sale.totalPaid,
          total_onUSD_amount: sale.total_onUSD_amount,
          shippingCost: sale.shippingCost,
          total_expenses: expense.total_expenses,
          total_salaries: salary.total_salaries,
          total_revenue:
            sale.total_income_amount -
            expense.total_expenses -
            salary.total_salaries,
        };
      });

      res.status(200).json(mergedResults);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },
};
