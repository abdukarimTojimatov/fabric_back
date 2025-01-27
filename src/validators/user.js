const Joi = require("joi");

const createSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  phone: Joi.number().required(),

  role: Joi.string().valid(
    "admin",
    "direktor",
    "rahbar",
    "sotuvchi",
    "omborchi",
    "ishchi"
  ),
  userSalaryType: Joi.string().valid("sales", "daily", "production").optional(),
  dailySalary: Joi.number().optional(),
  profile: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    bornDate: Joi.date().optional(),
    image: Joi.string().optional(),
  }),
  employmentStatus: Joi.string()
    .valid("active", "left", "paused")
    .default("active"),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  pausedDate: Joi.date().optional(),
});

const updateSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().optional(),
  password: Joi.string().optional(),
  role: Joi.string()
    .valid("admin", "direktor", "rahbar", "sotuvchi", "omborchi")
    .optional(),
  profile: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    bornDate: Joi.date().optional(),
  }).optional(),
  userSalaryType: Joi.string().valid("sales", "daily", "production").optional(),
  dailySalary: Joi.number().optional(),
  employmentStatus: Joi.string().valid("active", "left", "paused").optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  pausedDate: Joi.date().optional(),
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
  userSalaryType: Joi.string().valid("sales", "daily", "production").optional(),
  search: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
};
