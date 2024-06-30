const Salary = require("../models/salary");
const User = require("../models/user");
const Wallet = require("../models/wallet");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      const { users, salarySource } = req.body;

      // Step 1: Calculate the totalSalary
      let totalSalary = 0;
      users.forEach((user) => {
        user.monthlySalary = user.userWorkCount * user.dailySalary;
        totalSalary += user.monthlySalary;
      });

      // Step 2: Retrieve the wallet document
      const wallet = await Wallet.findOne();
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Step 3: Deduct the salary amount from the specified wallet source
      if (salarySource === "walletCash") {
        wallet.walletCash -= totalSalary;
        if (wallet.walletCash < 0)
          throw new Error("Insufficient funds in walletCash");
      } else if (salarySource === "walletCard") {
        wallet.walletCard -= totalSalary;
        if (wallet.walletCard < 0)
          throw new Error("Insufficient funds in walletCard");
      } else if (salarySource === "walletBank") {
        wallet.walletBank -= totalSalary;
        if (wallet.walletBank < 0)
          throw new Error("Insufficient funds in walletBank");
      } else {
        throw new Error("Invalid salarySource");
      }

      // Step 4: Save the updated wallet document
      await wallet.save();

      // Step 5: Create a new salary document
      const newSalary = new Salary({
        ...req.body,
        totalSalary: totalSalary,
      });
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
      const { users, salarySource, ...updateData } = req.body;

      // Find the salary document by ID
      let oldSalary = await Salary.findById(id);
      let salary = await Salary.findById(id);

      if (!salary) {
        return res.status(404).json({ message: "Ish haqi topilmadi" });
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
        (acc, user) => acc + user.userWorkCount * user.dailySalary,
        0
      );
      salary.totalSalary = totalSalary;

      // Save the updated salary document

      // Calculate the difference between the old and new total salaries
      let difference = totalSalary - oldSalary.totalSalary;

      const wallet = await Wallet.findOne();
      if (!wallet) {
        throw new Error("Hamyon topilmadi");
      }
      console.log("differene", difference);
      // Deduct or add the salary amount difference to the specified wallet source
      if (salarySource === "walletCash") {
        wallet.walletCash -= difference;
        if (wallet.walletCash < 0)
          throw new Error(
            "Naqd pul kassangizda yetarli miqdorda pul mavjud emas"
          );
      } else if (salarySource === "walletCard") {
        wallet.walletCard -= difference;
        if (wallet.walletCard < 0)
          throw new Error("Kartangizda  yetarli miqdorda pul mavjud emas");
      } else if (salarySource === "walletBank") {
        wallet.walletBank -= difference;
        if (wallet.walletBank < 0)
          throw new Error("Bank kassangizda yetarli miqdorda pul mavjud emas");
      } else {
        throw new Error("Invalid salarySource");
      }

      // Save the updated wallet document
      await wallet.save();
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
