const Salary = require("../models/salary");
const User = require("../models/user");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const newSalary = new Salary(req.body);
      const doc = await newSalary.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to add new salary", err.message));
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const { users, ...updateData } = req.body;

      // Find the salary document by ID
      let salary = await Salary.findById(id);

      if (!salary) {
        return res.status(404).json({ message: "Salary not found" });
      }

      // Update the fields of the salary document except for users
      salary.set(updateData);

      // Update users if provided
      if (users && users.length > 0) {
        users.forEach((newUser) => {
          const existingUserIndex = salary.users.findIndex((u) =>
            u._id.equals(newUser._id)
          );
          if (existingUserIndex !== -1) {
            // If user exists, update their data
            salary.users[existingUserIndex].set(newUser);

            // Recalculate monthlySalary for the updated user
            salary.users[existingUserIndex].monthlySalary =
              salary.users[existingUserIndex].userWorkCount *
              salary.users[existingUserIndex].dailySalary;
          } else {
            // If user doesn't exist, push new user
            newUser.monthlySalary = newUser.userWorkCount * newUser.dailySalary;
            salary.users.push(newUser);
          }
        });
      }

      // Calculate totalSalary
      const totalSalary = salary.users.reduce(
        (acc, user) => acc + parseFloat(user.monthlySalary),
        0
      );
      salary.totalSalary = totalSalary;

      // Save the updated salary document
      const updatedSalary = await salary.save();

      res.status(200).json(updatedSalary);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to update salary", err.message));
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedSalary = await Salary.findByIdAndDelete(id).exec();

      if (!deletedSalary) {
        return res.status(404).json({ message: "Salary not found" });
      }

      res.status(200).json({ message: "Salary deleted successfully" });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to delete salary", err.message));
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const salary = await Salary.findById(id);

      if (!salary) {
        return res.status(404).json({ message: "Salary not found" });
      }
      await User.populate(salary.users, {
        path: "user",
        select: ["profile.firstName", "profile.lastName"],
      });
      res.status(200).json(salary);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find salary", err.message));
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, year } = req.body;
      let query = {};
      if (year) {
        query.year = year;
      }
      let salaries;
      if (!limit || !page) {
        salaries = await Salary.find(query)
          .populate({
            path: "users.user",
            select: ["profile.firstName", "profile.lastName"],
            model: "User",
            strictPopulate: false,
          })
          .exec();
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };
        salaries = await Salary.paginate(query, options);
        await User.populate(salaries.docs, {
          path: "users.user",
          select: ["profile.firstName", "profile.lastName"],
          strictPopulate: false,
        });
      }

      res.status(200).json(salaries);
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, "Failed to find salaries", err.message));
    }
  },
};
