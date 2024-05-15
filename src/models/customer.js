const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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
      type: String,
      required: false,
    },
    startedDate: {
      type: Date,
      required: true,
    },
    finishedDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
);

customerSchema.plugin(mongoosePaginate);
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
