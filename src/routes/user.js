const express = require('express');
const {getAllUser,login,register}=require("../controllers/user");
// const {verifyToken}=require("../middlewares/auth");

const router = express.Router();

router.get("/",getAllUser)



router.post("/register",register)

router.post("/login",login)


module.exports = router;