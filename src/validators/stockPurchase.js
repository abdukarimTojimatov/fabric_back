const Joi = require("joi");

const createSchema = Joi.object({
  rawMaterial: Joi.string().required(),
  supplier: Joi.string().required(),
  quantityPurchased: Joi.number().optional(),
  costPerUnit: Joi.number().min(0),
  unitOfMeasurement: Joi.string().required(),
  costPerUnitOnUSD: Joi.number().optional(),
  oneUSDCurrency: Joi.number().optional(),
  shippingCost: Joi.number().optional(),
  shippingCostSource: Joi.string().optional(),
});

const updateSchema = Joi.object({
  rawMaterial: Joi.string().optional(),
  supplier: Joi.string().optional(),
  quantityPurchased: Joi.number().optional().min(1),
  costPerUnit: Joi.number().optional().min(0),
  id: Joi.string().required(),
  unitOfMeasurement: Joi.string().optional(),
  shippingCost: Joi.number().optional(),
  shippingCostSource: Joi.string().optional(),
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
  customer: Joi.string().optional(),
  user: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
