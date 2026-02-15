const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // allow only 3 requests
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
