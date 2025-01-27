const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");
const stockPurchaseSchema = new mongoose.Schema(
  {
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    quantityPurchased: {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    costPerUnit: {
      type: Number,
      min: 0,
    },
    shippingCost: {
      type: Number,
      min: 0,
    },
    costTotal: {
      type: Number,
      min: 0,
    },
    total_amountWithShippingCost: { type: Number, required: false },
    costPerUnitOnUSD: {
      type: Number,
      min: 0,
    },
    costTotalOnUSD: {
      type: Number,
      min: 0,
    },
    oneUSDCurrency: {
      type: Number,
      min: 0,
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
    shippingCostSource: {
      type: String,
      required: false,
      enum: ["walletCash", "walletCard", "walletBank"],
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
  },
  { timestamps: true, versionKey: false }
);
stockPurchaseSchema.plugin(mongoosePaginate);
const StockPurchase = mongoose.model("StockPurchase", stockPurchaseSchema);
module.exports = StockPurchase;
