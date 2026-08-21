const jwt = require("jsonwebtoken");

// 🔑 access token yaratish
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

module.exports = { generateAccessToken };