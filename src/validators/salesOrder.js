const Joi = require("joi");

const createSchema = Joi.object({
  customer: Joi.string().required(),
  customerType: Joi.string()
    .valid("fakturali", "fakturasiz", "naqd", "plastik")
    .required(),
  shippingAddress: Joi.string().optional(),
  orderNotes: Joi.string().optional(),
  autoNumber: Joi.string().optional(),
  tax: Joi.number().optional(),
  status: Joi.string()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .required(),
});

const updateSchema = Joi.object({
  customer: Joi.string().optional(),
  customerType: Joi.string()
    .valid("fakturali", "fakturasiz", "naqd", "plastik")
    .optional(),
  shippingAddress: Joi.string().optional(),
  orderNotes: Joi.string().optional(),
  autoNumber: Joi.string().optional(),
  tax: Joi.number().optional(),
  status: Joi.string()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .optional(),
  total_amount: Joi.number().optional(),
  total_origin_amount: Joi.number().optional(),
  total_income_amount: Joi.number().optional(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "partially-paid")
    .optional(),
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
    .valid("pending", "paid", "partially-paid")
    .optional(),
  status: Joi.string()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
