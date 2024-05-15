const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minLength: 4,
    maxLength: 50,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
    minLength: 9,
    maxLength: 9,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["admin", "direktor", "rahbar", "sotuvchi", "omborchi"],
    default: "rahbar",
  },
  profile: {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    bornDate: {
      type: Date,
    },
    image: {
      type: String,
    },
  },
  employmentStatus: {
    type: String,
    enum: ["active", "left", "paused"],
    default: "active",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  pausedDate: {
    type: Date,
  },
});

userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);
module.exports = User;
