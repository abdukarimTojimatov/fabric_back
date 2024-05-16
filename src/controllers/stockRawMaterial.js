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
      const { limit, page, search } = req.body;
      let query = {};

      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      let stocks;
      if (!req.body.page || !req.body.limit) {
        // Find all without pagination
        stocks = await StockRawMaterial.find(query)
          .populate({
            path: "rawMaterial",
            select: "name",
            model: "RawMaterial",
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
        const paginatedResults = await StockRawMaterial.paginate(
          query,
          options
        );
        stocks = await StockRawMaterial.populate(paginatedResults.docs, {
          path: "rawMaterial",
          select: "name",
          model: "RawMaterial",
          strictPopulate: false,
        });

        // Include pagination metadata in the response
        paginatedResults.docs = stocks; // Replace docs with populated docs
        stocks = paginatedResults;
      }

      return res.json(stocks);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find stocks", err.message));
    }
  },
};
