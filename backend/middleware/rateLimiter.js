const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Juda ko'p urinish bo'ldi. 15 daqiqadan keyin qayta urinib ko'ring."
  }
});

module.exports = authLimiter;