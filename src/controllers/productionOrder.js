const ProductionOrder = require("../models/productionOrder");
const { ErrorHandler } = require("../util/error");
const Product = require("../models/product");
const mongoose = require("mongoose");

const StockRawMaterial = require("../models/stockRawMaterial");
const StockProduct = require("../models/stockProduct");
module.exports = {
  addNew: async function (req, res, next) {
    try {
      const { product, quantity, unitOfMeasurement } = req.body;
      const orderedProduct = await Product.findById(product).populate(
        "ingredients"
      );

      const ingredientsWithTotalQuantity = orderedProduct.ingredients.map(
        (ingredient) => ({
          rawMaterial: ingredient.rawMaterial,
          quantityRequired: ingredient.quantityRequired,
          totalQuantity: ingredient.quantityRequired * quantity,
        })
      );

      for (const ingredient of ingredientsWithTotalQuantity) {
        const stockRawMaterial = await StockRawMaterial.findOne({
          rawMaterial: ingredient.rawMaterial,
        });
        if (!stockRawMaterial) {
          throw new Error(
            `Raw material with ID ${ingredient.rawMaterial} not found`
          );
        }
        if (stockRawMaterial.quantityInStock < ingredient.totalQuantity) {
          throw new Error(
            `Insufficient quantity of raw material ${stockRawMaterial.rawMaterial}`
          );
        }
        stockRawMaterial.quantityInStock -= ingredient.totalQuantity;
        await stockRawMaterial.save();
      }

      const stockProduct = await StockProduct.findOne({ product });
      if (!stockProduct) {
        const newStock = new StockProduct({
          product,
          quantityInStock: quantity,
          unitOfMeasurement: unitOfMeasurement,
        });
        const doc = await newStock.save();
      } else {
        stockProduct.quantityInStock += quantity;
        await stockProduct.save();
      }

      const newOrder = new ProductionOrder({
        product,
        quantity,
        ingredients: ingredientsWithTotalQuantity,
        completionDate: Date.now(),
        user: req.user._id,
        unitOfMeasurement: unitOfMeasurement,
      });

      const doc = await newOrder.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to add new production order", err.message)
      );
    }
  },
  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedOrder = await ProductionOrder.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).exec();

      if (!updatedOrder) {
        return res.status(404).json({ message: "Production order not found" });
      }

      res.status(200).json(updatedOrder);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to update production order", err.message)
      );
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedOrder = await ProductionOrder.findByIdAndDelete(id).exec();

      if (!deletedOrder) {
        return res.status(404).json({ message: "Production order not found" });
      }

      res
        .status(200)
        .json({ message: "Production order deleted successfully" });
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to delete production order", err.message)
      );
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const order = await ProductionOrder.findById(id)
        .populate({
          path: "ingredients.rawMaterial",
          select: ["name", "unitOfMeasurement"],
        })
        .populate({
          path: "product",
          select: ["name", "unitOfMeasurement"],
        })
        .populate({
          path: "user",
          select: ["name", "email"],
        })
        .exec();

      if (!order) {
        return res.status(404).json({ message: "Production order not found" });
      }

      res.status(200).json(order);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to find production order", err.message)
      );
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search, product, dateFrom, dateTo } = req.body;
      let query = {};
      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      if (product) {
        query.product = product;
      }
      let productionOrder;

      function parseDate(dateString, endOfDay = false) {
        const [year, month, day] = dateString.split(":");
        if (endOfDay) {
          return `${year}-${month}-${day}-23:59`;
        }
        return `${year}-${month}-${day}-00:00`;
      }

      if (dateFrom && dateTo) {
        const fromDate = parseDate(dateFrom);
        const toDate = parseDate(dateTo, true);
        query.date = { $gte: fromDate, $lte: toDate };
      }

      if (!limit || !page) {
        productionOrder = await ProductionOrder.find(query)
          .populate({
            path: "ingredients.rawMaterial",
            select: ["name", "unitOfMeasurement"],
          })
          .populate({
            path: "product",
            select: ["name", "unitOfMeasurement"],
          })
          .populate({
            path: "user",
            select: ["name", "email"],
          })
          .exec();
        res.status(200).json(productionOrder);
      } else {
        if (product) {
          query.product = new mongoose.Types.ObjectId(query.product);
        }

        const totalQuantityResult = await ProductionOrder.aggregate([
          { $match: query },
          { $group: { _id: null, totalQuantitySum: { $sum: "$quantity" } } },
        ]);

        const totalQuantitySum =
          totalQuantityResult.length > 0
            ? totalQuantityResult[0].totalQuantitySum
            : 0;

        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
          populate: [
            {
              path: "ingredients.rawMaterial",
              select: ["name", "unitOfMeasurement"],
            },
            {
              path: "product",
              select: ["name", "unitOfMeasurement"],
            },
            {
              path: "user",
              select: ["name", "email"],
            },
          ],
        };

        productionOrder = await ProductionOrder.paginate(query, options);

        productionOrder.totalQuantitySum = totalQuantitySum;
        res.status(200).json(productionOrder);
      }
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to find production orders", err.message)
      );
    }
  },
};
