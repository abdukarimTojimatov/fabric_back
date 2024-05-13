const Joi = require("joi");

const authValidator = Joi.object({
  password: Joi.string().required(),
  phone: Joi.string()
    .required()
    .length(9)
    .pattern(/^[0-9]+$/),
});

module.exports = {
  authValidator,
};
