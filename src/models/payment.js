const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");
const paymentSchema = new mongoose.Schema(
  {
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentFrom: {
      type: String,
      required: false,
    },
    amountOnUSD: {
      type: Number,
      required: false,
    },
    oneUSDCurrency: { type: Number },
    method: {
      type: String,
      enum: ["cash", "card", "transfer"],
      required: true,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
);

paymentSchema.plugin(mongoosePaginate);
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
