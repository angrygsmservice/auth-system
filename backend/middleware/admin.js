const User = require("../models/User");

const admin = async (req, res, next) => {
  try {
    console.log("========== ADMIN MIDDLEWARE ==========");
    console.log("AUTH USER:", req.user);

    const user = await User.findById(req.user.id).select("role");

    console.log("DB USER:", user);
    console.log("USER ROLE:", user?.role);
    console.log("EXPECTED ROLE: admin");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User topilmadi",
      });
    }

    if (user.role !== "admin") {
      console.log("❌ ADMIN CHECK FAILED");
      console.log("ACTUAL ROLE:", user.role);

      return res.status(403).json({
        success: false,
        message: "Faqat admin uchun",
      });
    }

    console.log("✅ ADMIN CHECK PASSED");

    next();
  } catch (err) {
    console.error("ADMIN MIDDLEWARE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server xatosi",
    });
  }
};

module.exports = admin;