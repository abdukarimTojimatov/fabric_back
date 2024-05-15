const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const rawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    rawMaterialPrice: {
      type: Number,
      required: true,
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
  },
  { timestamps: true, versionKey: false }
);

rawMaterialSchema.plugin(mongoosePaginate);
const RawMaterial = mongoose.model("RawMaterial", rawMaterialSchema);
module.exports = RawMaterial;
