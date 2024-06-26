const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");

const walletSchema = new mongoose.Schema(
  {
    walletCash: {
      type: Number,
      required: false,
      default: 0,
    },
    walletCard: {
      type: Number,
      required: false,
      default: 0,
    },
    walletBank: {
      type: Number,
      required: false,
      default: 0,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
  },
  { timestamps: false, versionKey: false }
);

walletSchema.plugin(mongoosePaginate);
const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
