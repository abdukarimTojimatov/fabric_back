const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
//
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    product_images: { type: Array, required: false, defaul: [] },
    product_originPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    product_status: {
      type: String,
      required: false,
      default: "active",
      enum: {
        values: ["paused", "active", "deleted"],
        message: "{VALUE} is not among permitted values",
      },
    },
    unitOfMeasurement: {
      type: String,
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
    product_sellingPrice: {
      type: Number,
      required: false,
      min: 0,
    },
    description: {
      type: String,
    },
    ingredients: [
      {
        rawMaterial: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RawMaterial",
        },
        quantityRequired: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

productSchema.plugin(mongoosePaginate);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
