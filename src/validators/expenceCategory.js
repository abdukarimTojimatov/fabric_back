const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
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
