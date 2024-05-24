const StockPurchase = require("../models/stockPurchase");
const RawMaterial = require("../models/rawMaterial");
const { ErrorHandler } = require("../util/error");
const StockRawMaterial = require("../models/stockRawMaterial");
const moment = require("moment");
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
      const parseDate = (dateString) => {
        const [year, month, day] = dateString.split(":").map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      };
      let query = {};

      if (rawMaterial) {
        query.rawMaterial = rawMaterial;
      }

      if (supplier) {
        query.supplier = supplier;
      }

      if (dateFrom && dateTo) {
        const fromDate = parseDate(dateFrom);
        const toDate = parseDate(dateTo);
        query.createdAt = { $gte: fromDate, $lte: toDate };
      } else if (dateFrom) {
        const date = parseDate(dateFrom);
        const nextDate = new Date(date);
        nextDate.setUTCDate(date.getUTCDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDate };
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
        // Paginate and then populate
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };

        // Use pagination and then manually populate
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

        // Include pagination metadata in the response
        paginatedResults.docs = populatedDocs; // Replace docs with populated docs
        purchases = paginatedResults;
      }

      return res.status(200).json(purchases);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find purchases", err.message));
    }
  },
};
