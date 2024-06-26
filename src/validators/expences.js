const Joi = require("joi");

const createSchema = Joi.object({
  category: Joi.string().required(),
  description: Joi.string().optional(),
  expencesSource: Joi.string().required(),
  amount: Joi.number().required().min(0),
});

const updateSchema = Joi.object({
  category: Joi.string().optional(),
  description: Joi.string().optional(),
  amount: Joi.number().optional().min(0),
  id: Joi.string().required(),
  expencesSource: Joi.string().optional(),
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
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
