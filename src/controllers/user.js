const User = require("../models/user");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      let user = await User.findOne({ phone: req.body.phone }).exec();
      if (user) {
        return res
          .status(400)
          .json({ message: "User with this phone number already exists." });
      }
      const newUser = new User(req.body);
      const doc = await newUser.save();

      if (!doc) throw new Error();
      return res.status(200).json(doc);
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler(400, "Failed to add new User " + err));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler(400, "Failed to update user " + err));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler(400, "Failed to delete user " + err));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id).exec();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler(400, "Failed to find user " + err));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search } = req.body;
      let query = {};
      if (search) {
        query["username"] = { $regex: new RegExp(search, "i") };
      }

      const options = {
        limit: parseInt(limit) || 10,
        page: parseInt(page) || 1,
      };

      const users = await User.paginate(query, options);

      if (!users) throw new Error();
      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler(400, "Failed to find users " + err));
    }
  },
};
