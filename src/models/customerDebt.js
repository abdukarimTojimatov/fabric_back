const mongoose = require("mongoose");

const customerDebtSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "late"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

const CustomerDebt = mongoose.model("CustomerDebt", customerDebtSchema);

module.exports = CustomerDebt;
