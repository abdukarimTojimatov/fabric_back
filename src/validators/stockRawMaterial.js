const Joi = require("joi");

const createSchema = Joi.object({
  rawMaterial: Joi.string().required(),
  quantityInStock: Joi.number().default(0).min(0),
  minimumQuantityStock: Joi.number().default(0).min(0),
  unitOfMeasurement: Joi.string()
    .valid("kg", "g", "meter", "dona", "liter", "ml", "qop", "metrkv", "tonna")
    .required(),
});

const updateSchema = Joi.object({
  rawMaterial: Joi.string().optional(),
  quantityInStock: Joi.number().optional().min(0),
  minimumQuantityStock: Joi.number().optional().min(0),
  id: Joi.string().required(),
  unitOfMeasurement: Joi.string()
    .valid("kg", "g", "meter", "dona", "liter", "ml", "qop", "metrkv", "tonna")
    .optional(),
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
