const Joi = require("joi");

const createSchema = Joi.object({
  category: Joi.string().required(),
  description: Joi.string().optional(),
  amount: Joi.number().required().min(0),
  date: Joi.date().default(new Date()),
});

const updateSchema = Joi.object({
  category: Joi.string().optional(),
  description: Joi.string().optional(),
  amount: Joi.number().optional().min(0),
  date: Joi.date().optional(),
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
