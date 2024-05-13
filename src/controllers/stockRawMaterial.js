const StockRawMaterial = require("../models/stockRawMaterial");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const newStock = new StockRawMaterial(req.body);
      const doc = await newStock.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new stock", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedStock = await StockRawMaterial.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).exec();

      if (!updatedStock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      res.status(200).json(updatedStock);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update stock", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedStock = await StockRawMaterial.findByIdAndDelete(id).exec();

      if (!deletedStock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      res.status(200).json({ message: "Stock deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete stock", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const stock = await StockRawMaterial.findById(id).exec();

      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      res.status(200).json(stock);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find stock", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const stocks = await StockRawMaterial.find().exec();
      res.status(200).json(stocks);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find stocks", err.message));
    }
  },
};
