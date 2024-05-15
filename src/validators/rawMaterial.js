const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().required().trim(), // Make the name required, trim whitespace
  description: Joi.string().optional().allow(""),
  rawMaterialPrice: Joi.number().optional(), // Allow an empty description
  unitOfMeasurement: Joi.string()
    .valid("kg", "g", "meter", "dona", "liter", "ml", "qop", "metrkv", "tonna")
    .required(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional().trim(),
  id: Joi.string().required(),
  description: Joi.string().optional().allow(""),
  rawMaterialPrice: Joi.number().optional(), // Allow an empty description
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
  limit: Joi.number().integer().min(1).default(10),
  page: Joi.number().integer().min(1).default(1),
  search: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
