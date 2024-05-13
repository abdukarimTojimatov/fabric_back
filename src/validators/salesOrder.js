const Joi = require("joi");

const createSchema = Joi.object({
  orderDate: Joi.date().optional(),
  customer: Joi.string().required(),
  total_amount: Joi.number().optional(),
  total_origin_amount: Joi.number().optional(),
  total_income_amount: Joi.number().optional(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "partially-paid", "cancelled")
    .optional(),
  shippingAddress: Joi.object({
    name: Joi.string().optional(),
    street: Joi.string().optional(),
    city: Joi.string().optional(),
  }).optional(),
  orderNotes: Joi.string().optional(),
  status: Joi.string()
    .valid(
      "draft",
      "confirmed",
      "in-production",
      "shipped",
      "completed",
      "cancelled"
    )
    .optional(),
});

const updateSchema = Joi.object({
  orderDate: Joi.date().optional(),
  customer: Joi.string().optional(),
  total_amount: Joi.number().optional(),
  total_origin_amount: Joi.number().optional(),
  total_income_amount: Joi.number().optional(),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "partially-paid", "cancelled")
    .optional(),
  shippingAddress: Joi.object({
    name: Joi.string().optional(),
    street: Joi.string().optional(),
    city: Joi.string().optional(),
  }).optional(),
  orderNotes: Joi.string().optional(),
  status: Joi.string()
    .valid(
      "draft",
      "confirmed",
      "in-production",
      "shipped",
      "completed",
      "cancelled"
    )
    .optional(),
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
  paymentStatus: Joi.string()
    .valid("pending", "paid", "partially-paid", "cancelled")
    .optional(),
  status: Joi.string()
    .valid(
      "draft",
      "confirmed",
      "in-production",
      "shipped",
      "completed",
      "cancelled"
    )
    .optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
