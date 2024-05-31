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

      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

      const totalSales = await SalesOrder.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
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

      const startDate = new Date(Date.UTC(year, 0, 1));
      const endDate = new Date(Date.UTC(year + 1, 0, 0, 23, 59, 59));

      const totalMonthlySales = await SalesOrder.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            total_amount: { $sum: "$total_amount" },
            total_origin_amount: { $sum: "$total_origin_amount" },
            total_income_amount: { $sum: "$total_income_amount" },
            totalDebt: { $sum: "$totalDebt" },
            totalPaid: { $sum: "$totalPaid" },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);
      console.log("totalMonthlySales", totalMonthlySales);
      const totalMonthlyExpenses = await ExpenseSchema.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            total_expenses: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);
      console.log("totalMonthlyExpenses", totalMonthlyExpenses);
      let yearNumber = parseInt(year, 10);
      console.log("yearNumber", typeof yearNumber);
      const totalMonthlySalaries = await Salary.aggregate([
        {
          $match: {
            year: yearNumber,
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

      console.log("totalMonthlySalaries", totalMonthlySalaries);
      // Generate a list of all months in the year
      const months = Array.from({ length: 12 }, (_, i) => i + 1);

      // Merge results and calculate total revenue for each month
      const mergedResults = months.map((month) => {
        const sale = totalMonthlySales.find((s) => s._id.month === month) || {
          total_amount: 0,
          total_origin_amount: 0,
          total_income_amount: 0,
          totalDebt: 0,
          totalPaid: 0,
        };
        const expense = totalMonthlyExpenses.find(
          (e) => e._id.month === month
        ) || { total_expenses: 0 };
        const salary = totalMonthlySalaries.find(
          (s) => s._id.month === month
        ) || { total_salaries: 0 };

        return {
          month: month,
          total_amount: sale.total_amount,
          total_origin_amount: sale.total_origin_amount,
          total_income_amount: sale.total_income_amount,
          totalDebt: sale.totalDebt,
          totalPaid: sale.totalPaid,
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
            createdAt: {
              $gte: new Date(Date.UTC(startYear, 0, 1)),
              $lte: new Date(Date.UTC(endYear, 11, 31, 23, 59, 59)),
            },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
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
          },
        },
      ]);

      const yearlyExpenses = await ExpenseSchema.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.UTC(startYear, 0, 1)),
              $lte: new Date(Date.UTC(endYear, 11, 31, 23, 59, 59)),
            },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            total_expenses: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
          },
        },
      ]);

      let start = parseInt(startYear, 10);
      let end = parseInt(endYear, 10);
      const yearlySalaries = await Salary.aggregate([
        {
          $match: {
            year: { $gte: start, $lte: end },
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
      console.log("yearlySalaries", yearlySalaries);
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
