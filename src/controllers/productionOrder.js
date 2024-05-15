const ProductionOrder = require("../models/productionOrder");
const { ErrorHandler } = require("../util/error");
const Product = require("../models/product");
const StockRawMaterial = require("../models/stockRawMaterial");
const StockProduct = require("../models/stockProduct");
module.exports = {
  addNew: async function (req, res, next) {
    try {
      const { product, quantity } = req.body;
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
        throw new Error(`Product with ID ${product} not found in stock`);
      }
      stockProduct.quantityInStock += quantity;
      await stockProduct.save();
      const newOrder = new ProductionOrder({
        product,
        quantity,
        ingredients: ingredientsWithTotalQuantity,
        completionDate: Date.now(),
        user: req.user._id,
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
      const order = await ProductionOrder.findById(id).exec();

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
      const orders = await ProductionOrder.find().exec();
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to find production orders", err.message)
      );
    }
  },
};
