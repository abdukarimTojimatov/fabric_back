const Joi = require("joi");
const { search } = require("../router");

const createSchema = Joi.object({
  product: Joi.string().required(),
  quantityInStock: Joi.number(),
  minimumQuantityStock: Joi.number(),
  unitOfMeasurement: Joi.string().required(),
});

const updateSchema = Joi.object({
  product: Joi.string().optional(),
  quantityInStock: Joi.number().optional(),
  minimumQuantityStock: Joi.number().optional(),
  id: Joi.string().required(),
  unitOfMeasurement: Joi.string().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  limit: Joi.number().integer().min(1),
  page: Joi.number().integer().min(1),
  search: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
