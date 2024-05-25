const SalesOrder = require("../models/salesOrder");
const SalesOrderItem = require("../models/salesOrderItem");
const Product = require("../models/product");
const StockProduct = require("../models/stockProduct");
const Payment = require("../models/payment");
const { ErrorHandler } = require("../util/error");

module.exports = {
  reportMonthly: async function (req, res, next) {
    try {
      const { year, month } = req.body;

      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      console.log("startDate", startDate, "endDate", endDate);

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
  reportYearly: async function (req, res, next) {
    try {
      const { year } = req.body;

      // Get the start and end dates for the provided year
      const startDate = new Date(Date.UTC(year, 0, 1));
      const endDate = new Date(Date.UTC(year + 1, 0, 0, 23, 59, 59));
      console.log("startDate", startDate, "endDate", endDate);

      const totalMonthlySales = await SalesOrder.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
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
            "_id.month": 1,
          },
        },
      ]);

      res.status(200).json(totalMonthlySales);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },
  reportAllYears: async function (req, res, next) {
    try {
      const { startYear, endYear } = req.body;
      const yearlySales = await SalesOrder.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startYear, 0, 1),
              $lte: new Date(endYear, 11, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: { $year: "$createdAt" },
            total_amount: { $sum: "$total_amount" },
            total_origin_amount: { $sum: "$total_origin_amount" },
            total_income_amount: { $sum: "$total_income_amount" },
            totalDebt: { $sum: "$totalDebt" },
            totalPaid: { $sum: "$totalPaid" },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      res.status(200).json(yearlySales);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },
};
