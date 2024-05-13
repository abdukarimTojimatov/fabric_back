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
    enum: ["kg", "g", "meter.kv", "meter", "piece", "liter", "ml", "sack"],
  },
  purchaseDate: {
    type: Date,
    default: Date().now,
  },
  costPerUnit: {
    type: Number,
    min: 0,
  },
});

const StockPurchase = mongoose.model("StockPurchase", stockPurchaseSchema);
module.exports = StockPurchase;
