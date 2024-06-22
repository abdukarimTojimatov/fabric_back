const SalesOrder = require("../models/salesOrder");
const SalesOrderItem = require("../models/salesOrderItem");
const StockPurchase = require("../models/stockPurchase");
const Product = require("../models/product");
const Salary = require("../models/salary");
const ExpenseSchema = require("../models/expences");
const moment = require("moment");
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

      const totalDailySales = await SalesOrder.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { day: { $substr: ["$date", 8, 2] } },
            total_amount: { $sum: "$total_amount" },
            total_origin_amount: { $sum: "$total_origin_amount" },
            total_income_amount: { $sum: "$total_income_amount" },
            totalDebt: { $sum: "$totalDebt" },
            totalPaid: { $sum: "$totalPaid" },
            total_onUSD_amount: { $sum: "$total_onUSD_amount" },
            totalShippingCostOnSale: { $sum: "$shippingCost" },
          },
        },
        {
          $sort: {
            "_id.day": 1,
          },
        },
      ]);

      const totalDailyExpenses = await ExpenseSchema.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { day: { $substr: ["$date", 8, 2] } },
            total_expenses: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            "_id.day": 1,
          },
        },
      ]);

      const totalDailySalaries = await Salary.aggregate([
        {
          $match: {
            year: parseInt(year, 10),
            month: parseInt(month, 10),
          },
        },
        {
          $group: {
            _id: { day: "$day" },
            total_salaries: { $sum: "$totalSalary" },
          },
        },
        {
          $sort: {
            "_id.day": 1,
          },
        },
      ]);

      const totalDailyStockPurchases = await StockPurchase.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { day: { $substr: ["$date", 8, 2] } },
            total_shippingCost: { $sum: "$shippingCost" },
            total_costTotalOnUSD: { $sum: "$costTotalOnUSD" },
            total_costTotal: { $sum: "$costTotal" },
          },
        },
        {
          $sort: {
            "_id.day": 1,
          },
        },
      ]);

      const daysInMonth = new Date(year, month, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      const mergedResults = days.map((day) => {
        const sale = totalDailySales.find(
          (s) => s._id.day === String(day).padStart(2, "0")
        ) || {
          total_amount: 0,
          total_origin_amount: 0,
          total_income_amount: 0,
          totalDebt: 0,
          totalPaid: 0,
          total_onUSD_amount: 0,
          totalShippingCostOnSale: 0,
        };

        const expense = totalDailyExpenses.find(
          (e) => e._id.day === String(day).padStart(2, "0")
        ) || {
          total_expenses: 0,
        };

        const salary = totalDailySalaries.find((s) => s._id.day === day) || {
          total_salaries: 0,
        };

        const stockPurchase = totalDailyStockPurchases.find(
          (sp) => sp._id.day === String(day).padStart(2, "0")
        ) || {
          total_shippingCost: 0,
          total_costTotalOnUSD: 0,
          total_costTotal: 0,
        };

        return {
          day: day,
          total_amount: sale.total_amount,
          total_origin_amount: sale.total_origin_amount,
          total_income_amount: sale.total_income_amount,
          total_onUSD_amount: sale.total_onUSD_amount,
          totalDebt: sale.totalDebt,
          totalPaid: sale.totalPaid,
          totalShippingCostOnSale: sale.totalShippingCostOnSale,
          total_expenses: expense.total_expenses,
          total_salaries: salary.total_salaries,
          totalShippingCostOnBuying: stockPurchase.total_shippingCost,
          totalCostTotalOnUSDOnBuying: stockPurchase.total_costTotalOnUSD,
          totalCostTotalOnUZSOnBuying: stockPurchase.total_costTotal,
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
            totalShippingCostOnSale: { $sum: "$shippingCost" },
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

      const totalMonthlyStockPurchases = await StockPurchase.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $substr: ["$date", 5, 2] } },
            total_shippingCost: { $sum: "$shippingCost" },
            total_costTotalOnUSD: { $sum: "$costTotalOnUSD" },
            total_costTotal: { $sum: "$costTotal" },
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
          totalShippingCostOnSale: 0,
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

        const stockPurchase = totalMonthlyStockPurchases.find(
          (sp) => sp._id.month === String(month).padStart(2, "0")
        ) || {
          total_shippingCost: 0,
          total_costTotalOnUSD: 0,
          total_costTotal: 0,
        };

        return {
          month: month,
          total_amount: sale.total_amount,
          total_origin_amount: sale.total_origin_amount,
          total_income_amount: sale.total_income_amount,
          total_onUSD_amount: sale.total_onUSD_amount,
          totalDebt: sale.totalDebt,
          totalPaid: sale.totalPaid,
          totalShippingCostOnSale: sale.totalShippingCostOnSale,
          total_expenses: expense.total_expenses,
          total_salaries: salary.total_salaries,
          totalShippingCostOnBuying: stockPurchase.total_shippingCost,
          totalCostTotalOnUSDOnBuying: stockPurchase.total_costTotalOnUSD,
          totalCostTotalOnUZSOnBuying: stockPurchase.total_costTotal,
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

      const startDate = `${startYear}-01-01-00:00`;
      const endDate = `${endYear}-12-31-23:59`;

      const yearlySales = await SalesOrder.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
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
            totalShippingCostOnSale: { $sum: "$shippingCost" },
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
            date: { $gte: startDate, $lte: endDate },
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

      const yearlyStockPurchases = await StockPurchase.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { year: { $substr: ["$date", 0, 4] } },
            total_shippingCost: { $sum: "$shippingCost" },
            total_costTotalOnUSD: { $sum: "$costTotalOnUSD" },
            total_costTotal: { $sum: "$costTotal" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
          },
        },
      ]);

      const years = Array.from({ length: endYear - startYear + 1 }, (_, i) =>
        (startYear + i).toString()
      );

      const mergedResults = years.map((year) => {
        const sale = yearlySales.find((s) => s._id.year === year) || {
          total_amount: 0,
          total_origin_amount: 0,
          total_income_amount: 0,
          totalDebt: 0,
          totalPaid: 0,
          total_onUSD_amount: 0,
          totalShippingCostOnSale: 0,
        };
        const expense = yearlyExpenses.find((e) => e._id.year === year) || {
          total_expenses: 0,
        };
        const salary = yearlySalaries.find(
          (s) => s._id.year === parseInt(year, 10)
        ) || {
          total_salaries: 0,
        };
        const stockPurchase = yearlyStockPurchases.find(
          (sp) => sp._id.year === year
        ) || {
          total_shippingCost: 0,
          total_costTotalOnUSD: 0,
          total_costTotal: 0,
        };

        return {
          year: year,
          total_amount: sale.total_amount,
          total_origin_amount: sale.total_origin_amount,
          total_income_amount: sale.total_income_amount,
          total_onUSD_amount: sale.total_onUSD_amount,
          totalDebt: sale.totalDebt,
          totalPaid: sale.totalPaid,
          totalShippingCostOnSale: sale.totalShippingCostOnSale,
          total_expenses: expense.total_expenses,
          total_salaries: salary.total_salaries,
          totalShippingCostOnBuying: stockPurchase.total_shippingCost,
          totalCostTotalOnUSDOnBuying: stockPurchase.total_costTotalOnUSD,
          totalCostTotalOnUZSOnBuying: stockPurchase.total_costTotal,
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
