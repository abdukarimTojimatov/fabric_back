const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const paymentSchema = new mongoose.Schema(
  {
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "card", "transfer"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

paymentSchema.plugin(mongoosePaginate);
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
