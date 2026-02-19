const express = require("express");

const {
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  uploadFile,
  getFiles
 
} = require("../controllers/collection");

const adminOnly = require("../middlewares/adminAuth");
const { verifyToken } = require("../middlewares/auth");
const limiter = require("../middlewares/rateLimiter");
const upload = require("../middlewares/upload");
const router = express.Router();


//GET ALL USERS

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */

router.get("/", limiter, verifyToken, getAllUser);



/**
 * @swagger
 * /user/files:
 *   get:
 *     summary: Get uploaded files (with pagination)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Number of files per page
 *
 *     responses:
 *       200:
 *         description: List of files
 *       401:
 *         description: Unauthorized
 */

router.get("/files", getFiles);

//GET USER BY ID

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 */
router.get("/:id", verifyToken, getUserById);


//UPDATE USER

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.put("/:id", verifyToken, updateUser);


//DELETE USER

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/:id", verifyToken, adminOnly, deleteUser);

//FILE UPLOAD

/**
 * @swagger
 * /user/upload:
 *   post:
 *     summary: Upload user profile image
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post("/upload", (req, res) => {

  upload.single("image")(req, res, async (err) => {

    // Multer errors
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    // No file selected
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    try {
      // Cloudinary upload
      await uploadFile(req, res);
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      res.status(500).json({
        message: "Upload failed",
      });
    }

  });

});



module.exports = router;