const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");
const productionOrder = new mongoose.Schema(
  {
    //
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
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
        totalQuantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
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
    status: {
      type: String,
      enum: ["expecting", "in-progress", "completed", "cancelled"],
      default: "completed",
    },

    scheduledDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
  },
  { timestamps: true, versionKey: false }
);
productionOrder.plugin(mongoosePaginate);
const ProductionOrder = mongoose.model("ProductionOrder", productionOrder);
module.exports = ProductionOrder;
