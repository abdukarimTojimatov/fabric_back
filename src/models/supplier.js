const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const supplierSchema = new mongoose.Schema({
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
  ourDebt: {
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
  ourDebt: {
    type: Date,
    required: false,
  },
});

supplierSchema.plugin(mongoosePaginate);
const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
