const express = require("express");
const {
  login,
  register,
  verifyOtp,
} = require("../controllers/user");

const validate = require("../middlewares/validate");
const registerValidation = require("../middlewares/errorValidate");

const router = express.Router();

//REGISTER
/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register new user
 *     tags: [User]
 *     security: []
 *     responses:
 *       200:
 *         description: User registered successfully
 */

router.post("/register", registerValidation, validate, register);

//LOGIN
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     security: []
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", login);

router.post("/verifyOtp", verifyOtp); 


module.exports = router;