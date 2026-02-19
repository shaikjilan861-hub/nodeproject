const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("../models/userSchema");
const File = require("../models/fileSchema");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const generateChecksum = require("../utils/checksum");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload APIs
 */


//GET ALL USERS
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
const getAllUser = async (req, res) => {
  try {
    const user = await User.find({});
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};


//GET USER BY ID
/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */
const getUserById = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};


//UPDATE USER
/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: John
 *               email: john@gmail.com
 *               password: 123456
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
const updateUser = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};


//DELETE USER
/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
const deleteUser = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};


//UPLOAD FILE
/**
 * @swagger
 * /user/upload:
 *   post:
 *     summary: Upload file to Cloudinary
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // ✅ Generate checksum BEFORE upload
    const checksum = generateChecksum(req.file.path);

    // OPTIONAL: duplicate file check
    const existingFile = await File.findOne({ checksum });

    if (existingFile) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        message: "Duplicate file detected",
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "uploads" }
    );

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Save to DB with checksum
    const newFile = await File.create({
      filename: result.public_id,
      path: result.secure_url,
      mimetype: req.file.mimetype,
      size: req.file.size,
      checksum: checksum, // ✅ added
    });

    res.status(200).json({
      message: "File uploaded successfully",
      file: newFile,
    });

  } catch (error) {
    res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
};



//  GET FILES WITH PAGINATION 
/**
 * @swagger
 * /user/files:
 *   get:
 *     summary: Get files with pagination
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 5
 *     responses:
 *       200:
 *         description: Files fetched successfully
 */
const getFiles = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: "Error fetching files",
      error: error.message,
    });
  }
};


module.exports = {
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  uploadFile,
  getFiles,
};
