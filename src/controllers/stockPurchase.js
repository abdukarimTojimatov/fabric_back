const StockPurchase = require("../models/stockPurchase");
const RawMaterial = require("../models/rawMaterial");
const Wallet = require("../models/wallet");
const { ErrorHandler } = require("../util/error");
const StockRawMaterial = require("../models/stockRawMaterial");
const mongoose = require("mongoose");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const material = await RawMaterial.findById(req.body.rawMaterial).exec();

      // Find or create the wallet
      let wallet = await Wallet.findOne({});
      if (!wallet) {
        wallet = new Wallet({
          walletCash: 0,
          walletCard: 0,
          walletBank: 0,
        });
      }

      // Deduct the amount from the appropriate wallet field
      if (req.body.shippingCostSource && req.body.shippingCost > 0) {
        switch (req.body.shippingCostSource) {
          case "walletCash":
            if (wallet.walletCash < req.body.shippingCost) {
              throw new Error("Sizda yetarli miqdorda pul mavjud emas");
            }
            wallet.walletCash -= req.body.shippingCost;
            break;
          case "walletCard":
            if (wallet.walletCard < req.body.shippingCost) {
              throw new Error(
                "Sizda yetarli miqdorda cartangizda pul mavjud emas"
              );
            }
            wallet.walletCard -= req.body.shippingCost;
            break;
          case "walletBank":
            if (wallet.walletBank < req.body.shippingCost) {
              throw new Error(
                "Sizda yetarli miqdorda bankingizda pul mavjud emas"
              );
            }
            wallet.walletBank -= req.body.shippingCost;
            break;
          default:
            throw new Error(`Invalid expense source ${shippingCostSource}`);
        }
      }

      const exceedStockRawMaterial = await StockRawMaterial.findOne({
        rawMaterial: req.body.rawMaterial,
      }).exec();

      let newPurchase;
      if (!exceedStockRawMaterial) {
        const newStock = new StockRawMaterial({
          rawMaterial: req.body.rawMaterial,
          quantityInStock: req.body.quantityPurchased,
          unitOfMeasurement: material.unitOfMeasurement,
        });

        const doc1 = await newStock.save();
        req.body.unitOfMeasurement = material.unitOfMeasurement;
        req.body.user = req.user._id;

        newPurchase = new StockPurchase({
          supplier: req.body.supplier,
          user: req.user._id,
          rawMaterial: req.body.rawMaterial,
          quantityPurchased: req.body.quantityPurchased,
          unitOfMeasurement: req.body.unitOfMeasurement,
          costPerUnit: req.body.costPerUnit,
          costTotal: req.body.quantityPurchased * req.body.costPerUnit,
          costPerUnitOnUSD: req.body.costPerUnitOnUSD,
          unitOfMeasurement: req.body.unitOfMeasurement,
          costTotalOnUSD:
            req.body.quantityPurchased * req.body.costPerUnitOnUSD,
          oneUSDCurrency: req.body.oneUSDCurrency,
          shippingCost: req.body.shippingCost,
          shippingCostSource: req.body.shippingCostSource,
          total_amountWithShippingCost:
            req.body.quantityPurchased * req.body.costPerUnit +
            req.body.shippingCost,
        });
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

        newPurchase = new StockPurchase({
          supplier: req.body.supplier,
          user: req.user._id,
          rawMaterial: req.body.rawMaterial,
          quantityPurchased: req.body.quantityPurchased,
          unitOfMeasurement: req.body.unitOfMeasurement,
          costPerUnit: req.body.costPerUnit,
          costTotal: req.body.quantityPurchased * req.body.costPerUnit,
          costPerUnitOnUSD: req.body.costPerUnitOnUSD,
          unitOfMeasurement: req.body.unitOfMeasurement,
          shippingCostSource: req.body.shippingCostSource,
          costTotalOnUSD:
            req.body.quantityPurchased * req.body.costPerUnitOnUSD,
          oneUSDCurrency: req.body.oneUSDCurrency,
          shippingCost: req.body.shippingCost,
          total_amountWithShippingCost:
            req.body.quantityPurchased * req.body.costPerUnit +
            req.body.shippingCost,
        });
      }

      const doc = await newPurchase.save();
      await wallet.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new purchase", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;

      // Fetch the original purchase document
      const originalPurchase = await StockPurchase.findById(id).exec();
      if (!originalPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      // Update the purchase document with the new values
      const updatedPurchase = await StockPurchase.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).exec();

      if (!updatedPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      // Calculate the difference in quantityPurchased
      const quantityDifference =
        updatedPurchase.quantityPurchased - originalPurchase.quantityPurchased;

      // Update the quantityInStock of the StockRawMaterial
      const updatedStock = await StockRawMaterial.findOneAndUpdate(
        { rawMaterial: originalPurchase.rawMaterial },
        { $inc: { quantityInStock: quantityDifference } },
        { new: true }
      ).exec();

      if (!updatedStock) {
        return res.status(404).json({ message: "StockRawMaterial not found" });
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

      // Fetch the purchase document to get quantityPurchased and rawMaterial
      const purchase = await StockPurchase.findById(id).exec();
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      // Delete the purchase document
      const deletedPurchase = await StockPurchase.findByIdAndDelete(id).exec();

      // Update the quantityInStock of the corresponding StockRawMaterial
      const updateStock = await StockRawMaterial.findOneAndUpdate(
        { rawMaterial: purchase.rawMaterial },
        { $inc: { quantityInStock: -purchase.quantityPurchased } },
        { new: true }
      ).exec();

      if (!updateStock) {
        return res.status(404).json({ message: "StockRawMaterial not found" });
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
          return `${year}-${month}-${day}-23:59`;
        }
        return `${year}-${month}-${day}-00:00`;
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
        query.date = { $gte: fromDate, $lte: toDate };
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
        res.status(200).json(purchases);
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
        return res.status(200).json(purchases);
      }
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find purchases", err.message));
    }
  },
};
