const StockPurchase = require("../models/stockPurchase");
const RawMaterial = require("../models/rawMaterial");
const { ErrorHandler } = require("../util/error");
const StockRawMaterial = require("../models/stockRawMaterial");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const material = await RawMaterial.findById(req.body.rawMaterial).exec();

      const exceedStockRawMaterial = await StockRawMaterial.findOne({
        rawMaterial: req.body.rawMaterial,
      }).exec();

      if (!exceedStockRawMaterial) {
        res.status(404).json({
          message:
            "Raw material not found on our lists,please create on stock this raw material",
        });
      }

      const updatedStockRawMaterial = await StockRawMaterial.findByIdAndUpdate(
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
      const purchase = await StockPurchase.findById(id).exec();

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
      const { limit, page } = req.body;

      let purchases;

      if (!req.body.page || !req.body.limit) {
        // Find all without pagination
        purchases = await StockPurchase.find()
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
        const paginatedResults = await StockPurchase.paginate({}, options);
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
