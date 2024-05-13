const SalesOrder = require("../models/salesOrder");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const newOrder = new SalesOrder(req.body);
      const doc = await newOrder.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new order", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedOrder = await SalesOrder.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(updatedOrder);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update order", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedOrder = await SalesOrder.findByIdAndDelete(id).exec();

      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete order", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const order = await SalesOrder.findById(id).exec();

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(order);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find order", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const orders = await SalesOrder.find().exec();
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },
};
