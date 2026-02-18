const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userSchema");
const File = require("../models/fileSchema");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ================= REGISTER =================
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.json({ message: "user already exist" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
  });

  res.json(newUser);
};


// ================= LOGIN =================
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "user not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({
    message: "user login successfully",
    user,
    token,
  });
};


// ================= GET ALL USERS =================
const getAllUser = async (req, res) => {
  const user = await User.find({});
  res.json(user);
};


// ================= GET USER BY ID =================
const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User fetched successfully",
    user,
  });
};


// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  const { id } = req.params;

  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    req.body,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User updated successfully",
    user: updatedUser,
  });
};


// ================= DELETE USER =================
const deleteUser = async (req, res) => {
  const { id } = req.params;

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User deleted successfully",
  });
};


//UPLOAD PROFILE IMAGE
// const uploadProfileImage = async (req, res) => {
//   try {

//     // user id comes from verifyToken middleware
//     const userId = req.user.id;

//     if (!req.file) {
//       return res.status(400).json({
//         message: "No file uploaded",
//       });
//     }

//     const imagePath = `/uploads/${req.file.filename}`;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { profileImage: imagePath },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Profile image uploaded successfully",
//       user: updatedUser,
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Upload failed",
//       error: error.message,
//     });
//   }
// };

const uploadFile = async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded"
    });
  }
   console.log("FILE PATH:", req.file.path);

const result = await cloudinary.uploader.upload(
  req.file.path,
  { folder: "uploads" }
);

console.log("CLOUDINARY RESULT:", result);

    // delete local temp file
    fs.unlinkSync(req.file.path);

   const newFile = await File.create({
      filename: result.public_id,
      path: result.secure_url,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

  res.status(200).json({
    message: "File uploaded successfully",
    file: newFile
  });
};

const getFiles = async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  const files = await File.find()
    .skip(skip)
    .limit(limit);

  res.json({
    page,
    limit,
    files,
  });
};


module.exports = {
  register,
  login,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  // uploadProfileImage,
  uploadFile ,  // ⭐ added
  getFiles
};
