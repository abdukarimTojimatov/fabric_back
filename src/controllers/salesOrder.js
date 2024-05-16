const SalesOrder = require("../models/salesOrder");
const SalesOrderItem = require("../models/salesOrderItem");
const Product = require("../models/product");
const User = require("../models/user");
const StockProduct = require("../models/stockProduct");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const {
        customer,
        payments,
        paymentStatus,
        customerType,
        shippingAddress,
        orderNotes,
        autoNumber,
        tax,
        status,
        items,
      } = req.body;
      let user = req.user._id;
      console.log("1");
      const salesOrder = new SalesOrder({
        customer,
        payments,
        paymentStatus,
        customerType,
        shippingAddress,
        orderNotes,
        autoNumber,
        tax,
        status,
        user,
      });

      const itemPromises = items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product with ID ${item.product} not found`);
        }

        const total_amount = item.quantity * product.product_sellingPrice;
        const total_origin_amount = item.quantity * product.product_originPrice;

        const total_income_amount = total_amount - total_origin_amount;
        const stockProduct = await StockProduct.findOne({
          product: item.product,
        });
        if (!stockProduct) {
          throw new Error(
            `Stock for product with ID ${item.product} not found`
          );
        }

        if (stockProduct.quantityInStock < item.quantity) {
          throw new Error(
            `Not enough quantity in stock for product with ID ${item.product}`
          );
        }
        stockProduct.quantityInStock -= item.quantity;
        await stockProduct.save();

        const salesOrderItem = new SalesOrderItem({
          customer: salesOrder.customer,
          product: item.product,
          salesOrder: salesOrder._id,
          quantity: item.quantity,
          unitOfMeasurement: product.unitOfMeasurement,
          total_amount,
          total_origin_amount,
          total_income_amount,
          subtotal: total_amount,
        });

        await salesOrderItem.save();
        return salesOrderItem;
      });

      const savedSalesOrderItems = await Promise.all(itemPromises);

      let totalSalesOrderAmount = 0;
      let totalSalesOrderOriginAmount = 0;
      let totalSalesOrderIncomeAmount = 0;

      savedSalesOrderItems.forEach((salesOrderItem) => {
        totalSalesOrderAmount += salesOrderItem.total_amount;
        totalSalesOrderOriginAmount += salesOrderItem.total_origin_amount;
        totalSalesOrderIncomeAmount += salesOrderItem.total_income_amount;
      });

      salesOrder.total_amount = totalSalesOrderAmount;
      salesOrder.total_origin_amount = totalSalesOrderOriginAmount;
      salesOrder.total_income_amount = totalSalesOrderIncomeAmount;

      await salesOrder.save();

      res
        .status(201)
        .json({ message: "Sales order created successfully", salesOrder });
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

  updatePayment: async function (req, res, next) {
    try {
      const { orderId } = req.params;
      const { amount, method } = req.body;
      console.log("req.params", req.params);
      const order = await SalesOrder.findById(orderId).exec();
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const payment = { amount, method };
      await order.updatePayments(payment);

      res.status(200).json({ message: "Payment updated successfully", order });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      const { limit, page, search } = req.body;
      let query = {};
      const options = {
        limit: parseInt(limit),
        page: parseInt(page),
      };
      const orders = await SalesOrder.paginate(query, options);
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find orders", err.message));
    }
  },
};
