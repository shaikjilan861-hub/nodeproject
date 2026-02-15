const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User=require("../models/userSchema");

const getAllUser=async(req, res) => {
  const user=await User.find({});
  res.json(user);   
};



const register=async(req,res)=>{
    const {name,email,password,role}=req.body;
     const existingUser = await User.findOne({ email });
    if(existingUser){
       return res.json({message:"user already exist"});
    }
      const hashedPassword = await bcrypt.hash(password, 10);
    const newUser=await User.create({name,email,password: hashedPassword,role:role || "user"});
    res.json(newUser);
}


const login=async(req,res)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user){
       return res.json({message:"user not found"});
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Invalid password" });
    }
      // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.json({message:"user login successfully",user,token});

}

module.exports = {getAllUser,register,login}
