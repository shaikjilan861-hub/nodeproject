const { body } = require("express-validator");

const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*]).+$/)
    .withMessage(
      "Password must contain at least one number and one special character"
    ),
];

module.exports = registerValidation;
