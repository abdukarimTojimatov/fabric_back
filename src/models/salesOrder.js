const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const salesOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true,
    required: true,
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
    required: false,
  },
  autoNumber: {
    type: String,
    required: false,
  },
  tax: {
    type: Number,
    min: 0,
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

// Pre-save middleware to generate orderNumber
salesOrderSchema.pre("save", async function (next) {
  try {
    if (!this.orderNumber) {
      const lastOrder = await this.constructor.findOne(
        {},
        {},
        { sort: { orderNumber: -1 } }
      );
      if (lastOrder) {
        this.orderNumber = lastOrder.orderNumber + 1;
      } else {
        this.orderNumber = 1;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
module.exports = SalesOrder;
