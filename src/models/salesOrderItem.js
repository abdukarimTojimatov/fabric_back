const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
//
//
//
const salesOrderItemSchema = new mongoose.Schema({
  orderDate: {
    type: Date,
    default: Date.now(),
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesOrder",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  incomePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingAddress: {
    name: { type: String },
    street: { type: String },
    city: { type: String },
  },
  orderNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "draft",
      "confirmed",
      "in-production",
      "shipped",
      "completed",
      "cancelled",
    ],
    default: "draft",
  },
});
salesOrderItemSchema.plugin(mongoosePaginate);
const SalesOrderItem = mongoose.model("SalesOrderItem", salesOrderItemSchema);
module.exports = SalesOrderItem;
