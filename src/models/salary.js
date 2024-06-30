const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const moment = require("moment");
const userSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userWorkCount: {
    type: Number,
    required: true,
  },
  dailySalary: {
    type: Number,
    required: true,
  },
  monthlySalary: {
    type: Number,
    required: true,
  },
});

const salarySchema = new Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    totalSalary: {
      type: Number,
      required: false,
    },
    salarySource: {
      type: String,
      required: true,
      enum: ["walletCash", "walletCard", "walletBank"],
    },
    users: [userSchema],
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD-HH:mm"),
    },
  },
  { timestamps: true, versionKey: false }
);

salarySchema.index({ year: 1, month: 1 }, { unique: true });
salarySchema.plugin(mongoosePaginate);
const Salary = mongoose.model("Salary", salarySchema);

module.exports = Salary;
