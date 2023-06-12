const Joi = require("joi");

const contactValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "pl"] } })
    .required(),

  phone: Joi.string()
    .regex(/^\d{3}-\d{3}-\d{3}$/)
    .message({
      "string.pattern.base": `Phone number must be written as 777-777-777.`,
    })
    .required(),
  favorite: Joi.boolean().optional(),
});

const contactValidationUpdate = Joi.object({
  name: Joi.string().min(3).max(30).optional(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "pl"] },
    })
    .optional(),
  phone: Joi.string()
    .regex(/^\d{3}-\d{3}-\d{3}$/)
    .message({
      "string.pattern.base": `Phone number must be written as 777-777-777.`,
    })
    .optional(),
  favorite: Joi.boolean().optional(),
}).min(1);

const contactValidationStatus = Joi.object({
  favorite: Joi.boolean().required(),
});

const validate = (schema, obj, next, res) => {
  const { error } = schema.validate(obj);
  if (error) {
    const [{ message }] = error.details;
    console.log(error);
    return res.json({
      status: "failure",
      code: 400,
      message: `${message.replace(/"/g, "")}`,
    });
  }
  next();
};

module.exports.createContact = (req, res, next) => {
  return validate(contactValidation, req.body, next, res);
};

module.exports.updateContact = (req, res, next) => {
  return validate(contactValidationUpdate, req.body, next, res);
};

module.exports.updateStatus = (req, res, next) => {
  return validate(contactValidationStatus, req.body, next, res);
};
