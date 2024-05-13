const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const stockRawMaterial = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RawMaterial",
    required: true,
    unique: true,
  },
  quantityInStock: {
    type: Number,
    default: 0,
  },
  minimumQuantityStock: {
    type: Number,
    default: 0,
  },
});
stockRawMaterial.plugin(mongoosePaginate);
const StockRawMaterial = mongoose.model("StockRawMaterial", stockRawMaterial);

module.exports = StockRawMaterial;
