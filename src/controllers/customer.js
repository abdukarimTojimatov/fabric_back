const { custom } = require("joi");
const Customer = require("../models/customer");
const { ErrorHandler } = require("../util/error");

module.exports = {
  addNew: async function (req, res, next) {
    try {
      let customer = await Customer.findOne({ phone: req.body.phone }).exec();

      // if (customer) {
      //   return res
      //     .status(400)
      //     .json({ message: "customer with this phone number already exists." });
      // }
      req.body.startedDate = new Date();

      const newCustomerr = new Customer(req.body);
      const doc = await newCustomerr.save();

      if (!doc) throw new Error("Failed to save new Customer");
      return res.status(200).json(doc);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to add new Customer", err.message)
      );
    }
  },

  updateOne: async function (req, res, next) {
    try {
      const { id } = req.params;

      const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
        new: true,
      }).exec();

      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.status(200).json(updatedCustomer);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to update Customer", err.message)
      );
    }
  },

  deleteOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const deletedCustomer = await Customer.findByIdAndDelete(id).exec();

      if (!deletedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.status(200).json({ message: "Customer deleted successfully" });
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to delete Customer", err.message)
      );
    }
  },

  findOne: async function (req, res, next) {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id).exec();

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.status(200).json(customer);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to find Customer", err.message)
      );
    }
  },

  findAll: async function (req, res, next) {
    try {
      const { limit, page, search, customerType } = req.body;

      let query = {};

      if (search) {
        query["name"] = { $regex: new RegExp(search, "i") };
      }

      if (customerType) {
        query["customerType"] = customerType;
      }

      let customers;
      if (!req.body.page || !req.body.limit) {
        customers = await Customer.find(query);
      } else {
        const options = {
          limit: parseInt(limit),
          page: parseInt(page),
        };

        const totalQuantityResult = await Customer.aggregate([
          { $match: query },
          {
            $group: { _id: null, totalQuantitySum: { $sum: "$customerDebt" } },
          },
        ]);

        const totalQuantitySum =
          totalQuantityResult.length > 0
            ? totalQuantityResult[0].totalQuantitySum
            : 0;

        customers = await Customer.paginate(query, options);
        customers.totalQuantitySum = totalQuantitySum;
      }

      if (!customers) throw new Error("Customers not found");
      return res.status(200).json(customers);
    } catch (err) {
      console.error(err);
      return next(
        new ErrorHandler(400, "Failed to find Customers", err.message)
      );
    }
  },
};
