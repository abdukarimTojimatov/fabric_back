const RawMaterial = require("../models/rawMaterial");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const newMaterial = new RawMaterial(req.body);
      const doc = await newMaterial.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(
        new ErrorHandler(400, "Failed to add new raw material", err.message)
      );
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedMaterial = await RawMaterial.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      ).exec();

      if (!updatedMaterial) {
        return res.status(404).json({ message: "Raw material not found" });
      }

      res.status(200).json(updatedMaterial);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update raw material", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedMaterial = await RawMaterial.findByIdAndDelete(id).exec();

      if (!deletedMaterial) {
        return res.status(404).json({ message: "Raw material not found" });
      }

      res.status(200).json({ message: "Raw material deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete raw material", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const material = await RawMaterial.findById(id).exec();

      if (!material) {
        return res.status(404).json({ message: "Raw material not found" });
      }

      res.status(200).json(material);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find raw material", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search } = req.body;
      let query = {};
      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      let materials;
      if (!req.body.page || !req.body.limit) {
        materials = await RawMaterial.find(query);
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };
        materials = await RawMaterial.paginate(query, options);
      }

      return res.json(materials);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find raw materials", err.message));
    }
  },
};
