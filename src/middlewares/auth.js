const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {

    // get token from header OR query
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.query.token;
console.log("AUTH:", req.headers.authorization);

    // check token exists
    if (!token) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // store user info
    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = { verifyToken };
 