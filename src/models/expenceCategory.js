const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const expenseCategory = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

expenseCategory.plugin(mongoosePaginate);
const ExpenseCategory = mongoose.model("ExpenseCategory", expenseCategory);
module.exports = ExpenseCategory;
