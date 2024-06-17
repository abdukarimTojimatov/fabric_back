const Joi = require("joi");

const createSchema = Joi.object({
  amount: Joi.number().required().min(0),
  amountOnUSD: Joi.number().optional().min(0),
  oneUSDCurrency: Joi.number().optional().min(0),
  method: Joi.string().valid("cash", "card", "transfer").required(),
  customer: Joi.string().optional(),
});

const updateSchema = Joi.object({
  amount: Joi.number().required().min(0),
  method: Joi.string().valid("cash", "card", "transfer").required(),
  customer: Joi.string().optional(),
  amountOnUSD: Joi.number().optional().min(0),
  oneUSDCurrency: Joi.number().optional().min(0),
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
  dateFrom: Joi.string().optional(),
  dateTo: Joi.string().optional(),
  customer: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
