const StockPurchase = require("../models/stockPurchase");
const RawMaterial = require("../models/rawMaterial");
const { ErrorHandler } = require("../util/error");
const StockRawMaterial = require("../models/stockRawMaterial");
const mongoose = require("mongoose");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const material = await RawMaterial.findById(req.body.rawMaterial).exec();

      const exceedStockRawMaterial = await StockRawMaterial.findOne({
        rawMaterial: req.body.rawMaterial,
      }).exec();

      if (!exceedStockRawMaterial) {
        const newStock = new StockRawMaterial({
          rawMaterial: req.body.rawMaterial,
          quantityInStock: req.body.quantityPurchased,
          unitOfMeasurement: material.unitOfMeasurement,
        });

        const doc1 = await newStock.save();
        req.body.unitOfMeasurement = material.unitOfMeasurement;
        req.body.user = req.user._id;

        const newPurchase = new StockPurchase(req.body);
        const doc = await newPurchase.save();
        res.status(201).json(doc);
      } else {
        const updatedStockRawMaterial =
          await StockRawMaterial.findByIdAndUpdate(
            exceedStockRawMaterial._id,
            {
              $inc: { quantityInStock: req.body.quantityPurchased },
            },
            { new: true }
          ).exec();

        req.body.unitOfMeasurement = material.unitOfMeasurement;
        req.body.user = req.user._id;

        const newPurchase = new StockPurchase(req.body);
        const doc = await newPurchase.save();
        res.status(201).json(doc);
      }
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new purchase", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedPurchase = await StockPurchase.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).exec();

      if (!updatedPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      res.status(200).json(updatedPurchase);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update purchase", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedPurchase = await StockPurchase.findByIdAndDelete(id).exec();

      if (!deletedPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      res.status(200).json({ message: "Purchase deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete purchase", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const purchase = await StockPurchase.findById(id)
        .populate({
          path: "rawMaterial",
          select: "name",
          model: "RawMaterial",
          strictPopulate: false,
        })
        .populate({
          path: "supplier",
          select: "name",
          model: "Supplier",
          strictPopulate: false,
        })
        .populate({
          path: "user",
          select: "username",
          model: "User",
          strictPopulate: false,
        })
        .exec();

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      res.status(200).json(purchase);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find purchase", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, rawMaterial, supplier, dateFrom, dateTo } = req.body;

      let purchases;
      function parseDate(dateString, endOfDay = false) {
        const [year, month, day] = dateString.split(":");
        if (endOfDay) {
          return new Date(`${year}-${month}-${day}T23:59:59.999Z`);
        }
        return new Date(`${year}-${month}-${day}T00:00:00Z`);
      }
      let query = {};

      if (rawMaterial) {
        query.rawMaterial = rawMaterial;
      }

      if (supplier) {
        query.supplier = supplier;
      }

      if (dateFrom && dateTo) {
        const fromDate = parseDate(dateFrom);
        const toDate = parseDate(dateTo, true);
        query.createdAt = { $gte: fromDate, $lte: toDate };
      }

      if (!req.body.page || !req.body.limit) {
        purchases = await StockPurchase.find(query)
          .populate({
            path: "rawMaterial",
            select: "name",
            model: "RawMaterial",
            strictPopulate: false,
          })
          .populate({
            path: "supplier",
            select: "name",
            model: "Supplier",
            strictPopulate: false,
          })
          .populate({
            path: "user",
            select: "username",
            model: "User",
            strictPopulate: false,
          })
          .exec();
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };
        if (rawMaterial) {
          query.rawMaterial = new mongoose.Types.ObjectId(query.rawMaterial);
        }

        if (supplier) {
          query.supplier = new mongoose.Types.ObjectId(query.supplier);
        }

        const totalQuantityResult = await StockPurchase.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalQuantitySum: { $sum: "$quantityPurchased" },
            },
          },
        ]);

        const totalQuantitySum =
          totalQuantityResult.length > 0
            ? totalQuantityResult[0].totalQuantitySum
            : 0;
        console.log("totalQuantityResult", totalQuantityResult);
        const paginatedResults = await StockPurchase.paginate(query, options);
        const populatedDocs = await StockPurchase.populate(
          paginatedResults.docs,
          [
            {
              path: "rawMaterial",
              select: "name",
              model: "RawMaterial",
              strictPopulate: false,
            },
            {
              path: "supplier",
              select: "name",
              model: "Supplier",
              strictPopulate: false,
            },
            {
              path: "user",
              select: "username",
              model: "User",
              strictPopulate: false,
            },
          ]
        );

        paginatedResults.docs = populatedDocs;
        purchases = paginatedResults;
        purchases.totalQuantitySum = totalQuantitySum;
      }

      return res.status(200).json(purchases);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find purchases", err.message));
    }
  },
};
