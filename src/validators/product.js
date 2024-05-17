const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().required(),
  product_images: Joi.array().items(Joi.string()).optional(),
  product_status: Joi.string().valid("paused", "active", "deleted").optional(),
  unitOfMeasurement: Joi.string()
    .valid("kg", "g", "meter.kv", "meter", "dona", "liter", "ml", "sack")
    .optional(),
  product_sellingPrice: Joi.number().required(),
  description: Joi.string().optional(),
  product_otherCost: Joi.number().optional(),
  ingredients: Joi.array()
    .items(
      Joi.object({
        rawMaterial: Joi.string().optional(),
        quantityRequired: Joi.number().optional(),
      })
    )
    .optional(),
});

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().optional(),
  product_images: Joi.array().items(Joi.string()).optional(),
  product_originPrice: Joi.number().optional(),
  product_status: Joi.string().valid("paused", "active", "deleted").optional(),
  unitOfMeasurement: Joi.string()
    .valid("kg", "g", "meter.kv", "meter", "dona", "liter", "ml", "sack")
    .optional(),
  product_sellingPrice: Joi.number().optional(),
  description: Joi.string().optional(),
  product_otherCost: Joi.number().optional(),
  ingredients: Joi.array()
    .items(
      Joi.object({
        rawMaterial: Joi.string().optional(),
        quantityRequired: Joi.number().optional(),
      })
    )
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
  search: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
