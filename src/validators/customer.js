const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.number().required(),
  address: Joi.string().optional(),
  notes: Joi.string().optional(),
  customerDebt: Joi.number().optional(),
  customerMoney: Joi.number().optional(),
  customerType: Joi.string().required(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.number().optional(),
  address: Joi.string().optional(),
  notes: Joi.string().optional(),
  id: Joi.string().optional(),
  customerType: Joi.string().optional(),
  customerMoney: Joi.number().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
  search: Joi.string().optional(),
  customerType: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
