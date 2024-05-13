const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const salesOrderSchema = new mongoose.Schema({
  //
  orderDate: {
    type: Date,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  total_amount: { type: Number },
  total_origin_amount: { type: Number },
  total_income_amount: { type: Number },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "partially-paid", "cancelled"],
    default: "pending",
  },
  shippingAddress: {
    name: { type: String },
    street: { type: String },
    city: { type: String },
  },
  orderNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "draft",
      "confirmed",
      "in-production",
      "shipped",
      "completed",
      "cancelled",
    ],
    default: "draft",
  },
});
salesOrderSchema.plugin(mongoosePaginate);
const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
module.exports = SalesOrder;
