const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const paymentSchema = new mongoose.Schema({
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesOrder",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "credit card", "debit card", "bank transfer", "paypal"],
    required: true,
  },
  transactionId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "partially-paid", "late", "cancelled"],
    default: "pending",
  },

  paymentDetails: {
    type: String,
  },
  paymentReference: {
    type: String,
  },
});

paymentSchema.plugin(mongoosePaginate);
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
