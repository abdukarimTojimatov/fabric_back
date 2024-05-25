const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const salesOrderSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true },
    customerType: { type: String, required: true },
    shippingAddress: { type: String, required: false },
    orderNotes: { type: String, required: false },
    customerType: {
      type: String,
      enum: ["fakturali", "fakturasiz", "naqd", "plastik"],
      required: true,
    },
    autoNumber: { type: String, required: false, unique: true },
    tax: { type: Number, required: false },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "hold",
        "cancelled",
      ],
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    total_amount: { type: Number, required: true },
    total_origin_amount: { type: Number, required: true },
    total_income_amount: { type: Number, required: true },
    totalDebt: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially-paid", "paid"],
      default: "unpaid",
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
