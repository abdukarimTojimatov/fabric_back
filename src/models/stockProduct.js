const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const stockProduct = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
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
  unitOfMeasurement: {
    type: String,
    required: true,
    enum: ["kg", "g", "meter", "dona", "liter", "ml", "qop", "metrkv", "tonna"],
  },
});
stockProduct.plugin(mongoosePaginate);
const StockProduct = mongoose.model("StockProduct", stockProduct);

module.exports = StockProduct;
