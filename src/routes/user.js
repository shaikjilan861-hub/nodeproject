const express = require('express');
const {getAllUser,login,register}=require("../controllers/user");
const {verifyToken}=require("../middlewares/auth");
// const {adminOnly}=require("../middlewares/adminAuth");
const limiter=require("../middlewares/rateLimiter");
const router = express.Router();

const validate = require("../middlewares/validate");
const registerValidation = require("../middlewares/errorValidate");

router.get("/",limiter,verifyToken,getAllUser)

router.post("/register",registerValidation,validate,register);


router.post("/login",login)


module.exports = router;