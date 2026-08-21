const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");
const { changeRole, uploadAvatar } = require("../controllers/authController");

// ADMIN USERS LIST
router.get("/admin/users", auth, admin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// DELETE USER
router.delete("/admin/users/:id", auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// RESTORE USER
router.put("/admin/users/restore/:id", auth, admin, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isDeleted: false },
    { new: true }
  );
  res.json(user);
});

// CHANGE ROLE
router.put("/admin/users/:id/role", auth, admin, changeRole);

// UPLOAD AVATAR
router.post("/upload-avatar", auth, upload.single("avatar"), uploadAvatar);

module.exports = router;