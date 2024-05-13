const Joi = require("joi");

const createSchema = Joi.object({
  salesOrder: Joi.string().required(),
  amount: Joi.number().required().min(0),
  paymentDate: Joi.date().default(new Date()),
  dueDate: Joi.date().required(),
  paymentMethod: Joi.string()
    .valid("cash", "credit card", "debit card", "bank transfer", "paypal")
    .required(),
  transactionId: Joi.string().optional(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "partially-paid", "late", "cancelled")
    .default("pending"),
  paymentDetails: Joi.string().optional(),
  paymentReference: Joi.string().optional(),
});

const updateSchema = Joi.object({
  amount: Joi.number().optional().min(0),
  paymentDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
  paymentMethod: Joi.string()
    .valid("cash", "credit card", "debit card", "bank transfer", "paypal")
    .optional(),
  transactionId: Joi.string().optional(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "partially-paid", "late", "cancelled")
    .optional(),
  paymentDetails: Joi.string().optional(),
  paymentReference: Joi.string().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  page: Joi.number().integer().min(1).default(1),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
