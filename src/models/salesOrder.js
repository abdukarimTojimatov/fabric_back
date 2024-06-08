const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");

const salesOrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    shippingAddress: { type: String, required: false },
    orderNotes: { type: String, required: false },
    autoNumber: { type: String, required: false, unique: true },
    tax: { type: Number, required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    total_amount: { type: Number, required: true },
    total_origin_amount: { type: Number, required: true },
    total_income_amount: { type: Number, required: true },
    amountFromCustomerMoney: { type: Number, default: 0 }, // New field
    totalDebt: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially-paid", "paid"],
      default: "unpaid",
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
  },
  { timestamps: true, versionKey: false }
);

salesOrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString().substr(-2);

    const lastOrder = await this.constructor
      .findOne({
        autoNumber: { $regex: `^${yearPrefix}` },
      })
      .sort({ autoNumber: -1 })
      .exec();

    let orderNumber;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.autoNumber.slice(2), 10);
      orderNumber = lastNumber + 1;
    } else {
      orderNumber = 1;
    }

    this.autoNumber = `${yearPrefix}${orderNumber.toString().padStart(4, "0")}`;
  }
  next();
});

salesOrderSchema.plugin(mongoosePaginate);

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
module.exports = SalesOrder;
