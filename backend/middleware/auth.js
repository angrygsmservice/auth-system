require("dotenv").config();

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    console.log("========== AUTH MIDDLEWARE START ==========");

    let token = req.headers.authorization;

    console.log("AUTH HEADER:", token);

    if (!token) {
      console.log("NO TOKEN");

      return res.status(401).json({
        success: false,
        message: "Token yo'q",
      });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    console.log("TOKEN:", token);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("DECODED:", decoded);
    } catch (err) {
      console.log("JWT ERROR NAME:", err.name);
      console.log("JWT ERROR MESSAGE:", err.message);

      return res.status(401).json({
        success: false,
        message: "Token noto'g'ri yoki expired",
      });
    }

    console.log("SEARCH USER:", decoded.id);

    const user = await User.findById(decoded.id);

    console.log("DB USER:", user);

    if (!user) {
      console.log("USER NOT FOUND");

      return res.status(401).json({
        success: false,
        message: "User topilmadi",
      });
    }

    // Soft deleted user
    if (user.isDeleted) {
      console.log("USER DELETED");

      return res.status(403).json({
        success: false,
        message: "Account o'chirilgan",
      });
    }

    // Suspended user
    // Admin suspended bo'lmagan bo'lsa, login/API ishlaydi
    if (user.status === "suspended") {
      console.log("USER SUSPENDED");

      return res.status(403).json({
        success: false,
        message: "Account suspended",
      });
    }

    // Authenticated user
    req.user = {
      id: user._id,
      role: user.role,
      status: user.status,
    };

    console.log("AUTH USER:", req.user);

    console.log("NEXT() CALLED");

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server xatosi",
    });
  }
};

module.exports = auth;