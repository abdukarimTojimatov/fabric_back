const mongoose = require("mongoose");

const stockPurchaseSchema = new mongoose.Schema({
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
    enum: ["kg", "g", "meter", "dona", "liter", "ml", "qop", "metrkv", "tonna"],
  },
  purchaseDate: {
    type: Date,
    default: Date().now,
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
});

const StockPurchase = mongoose.model("StockPurchase", stockPurchaseSchema);
module.exports = StockPurchase;
