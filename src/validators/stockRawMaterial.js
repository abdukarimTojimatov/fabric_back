const Joi = require("joi");

const createSchema = Joi.object({
  rawMaterial: Joi.string().required(),
  quantityInStock: Joi.number().default(0).min(0),
  minimumQuantityStock: Joi.number().default(0).min(0),
});

const updateSchema = Joi.object({
  rawMaterial: Joi.string().optional(),
  quantityInStock: Joi.number().optional().min(0),
  minimumQuantityStock: Joi.number().optional().min(0),
  id: Joi.string().required(),
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
