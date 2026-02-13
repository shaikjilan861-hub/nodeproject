const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token (remove "Bearer ")
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user info in request
    req.user = decoded;

    next(); // move to next middleware/controller

  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {verifyToken};
