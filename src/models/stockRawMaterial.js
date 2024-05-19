const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const stockRawMaterial = new mongoose.Schema(
  {
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true,
    },
    quantityInStock: {
      type: Number,
      default: 0,
    },
    minimumQuantityStock: {
      type: Number,
      default: 0,
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
  },
  { timestamps: true, versionKey: false }
);
stockRawMaterial.plugin(mongoosePaginate);
const StockRawMaterial = mongoose.model("StockRawMaterial", stockRawMaterial);

module.exports = StockRawMaterial;
