const Joi = require("joi");

const createSchema = Joi.object({
  customer: Joi.string().required(),
  shippingAddress: Joi.string().optional(),
  orderNotes: Joi.string().optional(),
  autoNumber: Joi.string().optional(),
  tax: Joi.number().optional(),
});

const updateSchema = Joi.object({
  customer: Joi.string().optional(),
  shippingAddress: Joi.string().optional(),
  orderNotes: Joi.string().optional(),
  autoNumber: Joi.string().optional(),
  tax: Joi.number().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  limit: Joi.number().integer().optional(),
  page: Joi.number().integer().optional(),
  paymentStatus: Joi.string()
    .valid("unpaid", "paid", "partially-paid")
    .optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
