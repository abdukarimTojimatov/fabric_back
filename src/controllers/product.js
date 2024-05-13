const Product = require("../models/product");
const RawMaterial = require("../models/rawMaterial");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const { ingredients } = req.body;
      let totalCost = 0;

      for (const ingredient of ingredients) {
        const rawMaterial = await RawMaterial.findById(ingredient.rawMaterial);
        totalCost += rawMaterial.rawMaterialPrice * ingredient.quantityRequired;
      }

      req.body.product_originPrice = totalCost;

      const newProduct = new Product(req.body);
      const doc = await newProduct.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new product", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(updatedProduct);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update product", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedProduct = await Product.findByIdAndDelete(id).exec();

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete product", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id).exec();

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find product", err.message));
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

      const products = await Product.paginate(query, options);
      res.status(200).json(products);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find products", err.message));
    }
  },
};
