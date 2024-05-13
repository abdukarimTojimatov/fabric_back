const Joi = require("joi");

const createSchema = Joi.object({
  product: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  status: Joi.string()
    .valid("expecting", "in-progress", "completed", "cancelled")
    .optional(),
  scheduledDate: Joi.date().optional(),
  completionDate: Joi.date().optional(),
});

const updateSchema = Joi.object({
  product: Joi.string().optional(),
  id: Joi.string().optional(),
  quantity: Joi.number().integer().min(1).optional(),
  ingredients: Joi.array()
    .items(
      Joi.object({
        rawMaterial: Joi.string().optional(),
        quantityRequired: Joi.number().integer().min(0).optional(),
        totalQuantity: Joi.number().integer().min(0).optional(),
      })
    )
    .optional(),
  status: Joi.string()
    .valid("expecting", "in-progress", "completed", "cancelled")
    .optional(),
  scheduledDate: Joi.date().optional(),
  completionDate: Joi.date().optional(),
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
  status: Joi.string()
    .valid("pending", "in-progress", "completed", "cancelled")
    .optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
