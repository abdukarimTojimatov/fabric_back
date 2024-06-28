const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");
const rawWasteSchema = new mongoose.Schema(
  {
    rawMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
    },
    notes: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
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
  },
  { timestamps: false, versionKey: false }
);

rawWasteSchema.plugin(mongoosePaginate);
const RawWaste = mongoose.model("RawWaste", rawWasteSchema);
module.exports = RawWaste;
