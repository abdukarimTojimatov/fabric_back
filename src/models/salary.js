const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
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
    default: function () {
      return this.userWorkCount * this.dailySalary;
    },
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
    users: [userSchema],
  },
  { timestamps: true, versionKey: false }
);

salarySchema.pre("save", async function (next) {
  const totalSalary = this.users.reduce((acc, user) => {
    return acc + parseFloat(user.monthlySalary);
  }, 0);

  this.totalSalary = totalSalary;

  next();
});
salarySchema.index({ year: 1, month: 1 }, { unique: true });
salarySchema.plugin(mongoosePaginate);
const Salary = mongoose.model("Salary", salarySchema);

module.exports = Salary;
