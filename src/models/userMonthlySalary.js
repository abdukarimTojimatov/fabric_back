const mongoose = require("mongoose");
const moment = require("moment");
const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  present: {
    type: Boolean,
    default: false,
  },
});

const userMonthlySalarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  totalPresentDays: {
    type: Number,
    default: 0,
  },
  salary: {
    type: Number,
    required: true,
  },
  attendance: [attendanceSchema],
  date: {
    type: String,
    default: moment().format("YYYY-MM-DD-HH:mm"),
  },
});

const UserMonthlySalary = mongoose.model(
  "UserMonthlySalary",
  userMonthlySalarySchema
);

module.exports = UserMonthlySalary;
