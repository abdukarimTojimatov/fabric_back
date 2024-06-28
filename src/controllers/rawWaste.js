const RawWaste = require("../models/rawWaste");
const StockRawMaterial = require("../models/stockRawMaterial");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const { rawMaterial, quantity, unitOfMeasurement } = req.body;

      // Step 1: Check if the raw material exists in the stock
      const stockItem = await StockRawMaterial.findOne({ rawMaterial });

      if (!stockItem) {
        throw new Error("Raw material not found in stock.");
      }

      // Step 2: Check if the unit of measurement matches
      if (stockItem.unitOfMeasurement !== unitOfMeasurement) {
        throw new Error("Unit of measurement does not match.");
      }

      // Step 3: Check if there is sufficient quantity in stock
      if (stockItem.quantityInStock < quantity) {
        throw new Error("Insufficient quantity in stock.");
      }

      // Step 4: Create the new RawWaste entry
      const newRawWaste = new RawWaste(req.body);
      const rawWasteDoc = await newRawWaste.save();

      // Step 5: Update the stock quantity
      stockItem.quantityInStock -= quantity;
      await stockItem.save();

      res.status(201).json(rawWasteDoc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new RawWaste", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const { rawMaterial, quantity, unitOfMeasurement } = req.body;

      // Step 1: Retrieve the old RawWaste entry
      const oldRawWaste = await RawWaste.findById(id).exec();
      if (!oldRawWaste) {
        return res.status(404).json({ message: "RawWaste not found" });
      }

      // Step 2: Check if the new raw material exists in the stock
      const newStockItem = await StockRawMaterial.findOne({ rawMaterial });
      if (!newStockItem) {
        throw new Error("New raw material not found in stock.");
      }

      // Step 3: Check if the unit of measurement matches for the new raw material
      if (newStockItem.unitOfMeasurement !== unitOfMeasurement) {
        throw new Error(
          "Unit of measurement does not match for the new raw material."
        );
      }

      // Step 4: Calculate quantity differences
      const quantityDifference = quantity - oldRawWaste.quantity;

      // Step 5: If the raw material is changed, check the new raw material's stock
      if (oldRawWaste.rawMaterial.toString() !== rawMaterial) {
        if (newStockItem.quantityInStock < quantity) {
          throw new Error(
            "Insufficient quantity in stock for the new raw material."
          );
        }

        const oldStockItem = await StockRawMaterial.findOne({
          rawMaterial: oldRawWaste.rawMaterial,
        });
        if (!oldStockItem) {
          throw new Error("Old raw material not found in stock.");
        }

        // Revert the quantity in stock for the old raw material
        oldStockItem.quantityInStock += oldRawWaste.quantity;
        await oldStockItem.save();

        // Update the stock quantity for the new raw material
        newStockItem.quantityInStock -= quantity;
      } else {
        // If the raw material is not changed, just update the stock quantity
        if (
          quantityDifference > 0 &&
          newStockItem.quantityInStock < quantityDifference
        ) {
          throw new Error("Insufficient quantity in stock.");
        }
        newStockItem.quantityInStock -= quantityDifference;
      }

      await newStockItem.save();

      // Step 6: Update the RawWaste entry
      const updatedRawWaste = await RawWaste.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      res.status(200).json(updatedRawWaste);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update RawWaste", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;

      // Step 1: Retrieve the RawWaste entry to be deleted
      const rawWasteToDelete = await RawWaste.findById(id).exec();
      if (!rawWasteToDelete) {
        return res.status(404).json({ message: "RawWaste not found" });
      }

      // Step 2: Find the corresponding stock item in the StockRawMaterial collection
      const stockItem = await StockRawMaterial.findOne({
        rawMaterial: rawWasteToDelete.rawMaterial,
      }).exec();
      if (!stockItem) {
        throw new Error("Corresponding raw material not found in stock.");
      }

      // Step 3: Revert the quantity of the raw material in stock
      stockItem.quantityInStock += rawWasteToDelete.quantity;
      await stockItem.save();

      // Step 4: Delete the RawWaste entry
      await RawWaste.findByIdAndDelete(id).exec();

      res.status(200).json({ message: "RawWaste deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete RawWaste", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const rawWaste = await RawWaste.findById(id).exec();

      if (!rawWaste) {
        return res.status(404).json({ message: " RawWaste not found" });
      }

      res.status(200).json(rawWaste);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find  RawWaste", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search } = req.body;
      let query = {};
      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      let rawWastes;
      if (!req.body.page || !req.body.limit) {
        rawWastes = await RawWaste.find(query);
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };
        rawWastes = await RawWaste.paginate(query, options);
      }

      return res.json(rawWastes);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find  rawWastes", err.message));
    }
  },
};
