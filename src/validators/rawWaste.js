const Joi = require("joi");

const createSchema = Joi.object({
  rawMaterial: Joi.string().required(), // Make the name required, trim whitespace
  notes: Joi.string().optional(),
  quantity: Joi.number().optional(), // Allow an empty description
  unitOfMeasurement: Joi.string()
    .valid("kg", "g", "meter", "dona", "liter", "ml", "qop", "metrkv", "tonna")
    .required(),
});

const updateSchema = Joi.object({
  rawMaterial: Joi.string().optional(), // Make the name required, trim whitespace
  notes: Joi.string().optional(),
  id: Joi.string().required(),
  quantity: Joi.number().optional(), // Allow an empty description
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
  rawMaterial: Joi.string().optional(),
  dateFrom: Joi.string().optional(),
  dateTo: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
