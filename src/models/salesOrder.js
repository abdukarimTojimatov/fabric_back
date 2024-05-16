const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const paymentSchema = new mongoose.Schema({
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
    default: Date.now(),
  },
});

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
      required: false,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    total_amount: { type: Number },
    total_origin_amount: { type: Number },
    total_income_amount: { type: Number },
    totalPaid: {
      type: Number,
      default: 0,
    },
    totalDebt: {
      type: Number,
      default: 0,
    },
    payments: [paymentSchema],
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partially-paid", "cancelled"],
      default: function () {
        if (this.totalDebt === 0) {
          return "paid";
        } else if (this.totalPaid === 0) {
          return "pending";
        } else if (this.totalPaid < this.total_amount) {
          return "partially-paid";
        } else {
          return "pending";
        }
      },
    },
    customerType: {
      type: String,
      enum: ["fakturali", "fakturasiz", "naqd", "plastik"],
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

salesOrderSchema.plugin(mongoosePaginate);

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

    let totalPaid = 0;
    this.payments.forEach((payment) => {
      totalPaid += payment.amount;
    });
    this.totalPaid = totalPaid;
    this.totalDebt = this.total_amount - totalPaid;

    if (this.totalDebt === 0) {
      this.paymentStatus = "paid";
    } else if (this.totalPaid === 0) {
      this.paymentStatus = "pending";
    } else if (this.totalPaid < this.total_amount) {
      this.paymentStatus = "partially-paid";
    } else {
      this.paymentStatus = "pending";
    }

    next();
  } catch (error) {
    next(error);
  }
});

salesOrderSchema.methods.updatePayments = async function (payment) {
  try {
    this.payments.push(payment);

    let totalPaid = 0;
    this.payments.forEach((payment) => {
      totalPaid += payment.amount;
    });

    this.totalPaid = totalPaid;
    this.totalDebt = this.total_amount - totalPaid;

    if (this.totalDebt === 0) {
      this.paymentStatus = "paid";
    } else if (this.totalPaid === 0) {
      this.paymentStatus = "pending";
    } else if (this.totalPaid < this.total_amount) {
      this.paymentStatus = "partially-paid";
    } else {
      this.paymentStatus = "pending";
    }

    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
};

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
module.exports = SalesOrder;
