const Joi = require("joi");

const createSchema = Joi.object({
  year: Joi.number().required(),
  month: Joi.number().required(),
  totalSalary: Joi.number().optional(),
  users: Joi.array()
    .items(
      Joi.object({
        user: Joi.string().required(),
        userWorkCount: Joi.number().required(),
        dailySalary: Joi.number().required().min(0),
      })
    )
    .required(),
});

const updateSchema = Joi.object({
  year: Joi.number().optional(),
  month: Joi.number().optional(),
  totalSalary: Joi.number().optional().min(0),
  users: Joi.array()
    .items(
      Joi.object({
        user: Joi.string().optional(),
        userWorkCount: Joi.number().optional(),
        dailySalary: Joi.number().optional().min(0),
        monthlySalary: Joi.string().optional(),
      })
    )
    .optional(),
  id: Joi.string().required(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  limit: Joi.number().integer().optional(),
  year: Joi.number().integer().optional(),
  page: Joi.number().integer().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
