const Joi = require("joi");

const createSchema = Joi.object({
  walletCash: Joi.number().required(),
  walletCard: Joi.number().required(),
  walletBank: Joi.number().required(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  walletCash: Joi.number().optional(),
  walletCard: Joi.number().optional(),
  walletBank: Joi.number().optional(),
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
