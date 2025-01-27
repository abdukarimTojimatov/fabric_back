const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");
const salesOrderItemSchema = new mongoose.Schema(
  {
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
    unitOfMeasurement: {
      type: String,
      required: true,
      enum: [
        "kg",
        "g",
        "meter",
        "dona",
        "liter",
        "ml",
        "qop",
        "metrkv",
        "tonna",
      ],
    },
    total_amount: { type: Number },
    total_origin_amount: { type: Number },
    total_amountOnUSD: { type: Number },
    total_income_amount: { type: Number },
    oneUSDCurrency: { type: Number },
    product_sellingPrice: { type: Number },
    product_sellingPriceOnUSD: { type: Number },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
  },
  { timestamps: true, versionKey: false }
);

salesOrderItemSchema.plugin(mongoosePaginate);

const SalesOrderItem = mongoose.model("SalesOrderItem", salesOrderItemSchema);
module.exports = SalesOrderItem;
