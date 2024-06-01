const { required } = require("joi");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      required: true,
    },

    description: {
      type: String,
      required: false,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);
expenseSchema.plugin(mongoosePaginate);
const ExpenseSchema = mongoose.model("ExpenseSchema", expenseSchema);
module.exports = ExpenseSchema;
