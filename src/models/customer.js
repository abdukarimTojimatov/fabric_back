const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    customerDebt: {
      type: Number,
      required: false,
      default: 0,
    },
    customerType: {
      type: String,
      required: true,
      enum: ["gips", "gipsakardon"],
    },
    customerMoney: {
      type: Number,
      required: false,
      default: 0,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
    finishedDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: false, versionKey: false }
);

customerSchema.plugin(mongoosePaginate);
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
