const Supplier = require("../models/supplier");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      let supplier = await Supplier.findOne({ phone: req.body.phone }).exec();

      if (supplier) {
        return res
          .status(400)
          .json({ message: "Supplier with this phone number already exists." });
      }
      req.body.startedDate = new Date();
      console.log(req.body);
      const newSupplier = new Supplier(req.body);
      const doc = await newSupplier.save();

      if (!doc) throw new Error("Failed to save new Supplier");
      return res.status(200).json(doc);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to add new Supplier", err.message)
      );
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;

      const updatedSupplier = await Supplier.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      return res.status(200).json(updatedSupplier);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to update supplier", err.message)
      );
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedSupplier = await Supplier.findByIdAndDelete(id).exec();

      if (!deletedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      return res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to delete supplier", err.message)
      );
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findById(id).exec();

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      return res.status(200).json(supplier);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to find supplier", err.message)
      );
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit = 10, page = 1, search } = req.body;
      let query = {};

      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      const options = {
        limit: parseInt(limit),
        page: parseInt(page),
      };

      const suppliers = await Supplier.paginate(query, options);

      if (!suppliers) throw new Error("Suppliers not found");
      return res.status(200).json(suppliers);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to find suppliers", err.message)
      );
    }
  },
};
