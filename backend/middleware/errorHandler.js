const errorHandler = (err, req, res, next) => {
  console.error("========== ERROR ==========");
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server xatosi";

  // MongoDB ObjectId xatosi
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Noto'g'ri ID";
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = "Bu ma'lumot allaqachon mavjud";
  }

  // JWT xatosi
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token noto'g'ri";
  }

  // JWT muddati tugagan
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token muddati tugagan";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;