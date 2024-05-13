const Joi = require("joi");

const createSchema = Joi.object({
  customer: Joi.string().required(),
  amount: Joi.number().required().min(0),
  dueDate: Joi.date().required(),
  status: Joi.string().valid("pending", "paid", "late").default("pending"),
  paymentDate: Joi.date().optional(),
});

const updateSchema = Joi.object({
  customer: Joi.string().optional(),
  amount: Joi.number().optional().min(0),
  dueDate: Joi.date().optional(),
  status: Joi.string().valid("pending", "paid", "late").optional(),
  paymentDate: Joi.date().optional(),
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
