const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.number().required(),
  address: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.number().optional(),
  address: Joi.string().optional(),
  notes: Joi.string().optional(),
  id: Joi.string().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  limit: Joi.number().min(1).optional(),
  page: Joi.number().min(1).optional(),
  search: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
