const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User topilmadi",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "User topilmadi",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile muvaffaqiyatli yangilandi",
    data: updatedUser,
  });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Rasm tanlanmagan",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      avatar: "/uploads/avatars/" + req.file.filename,
    },
    {
      new: true,
    }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Avatar muvaffaqiyatli yuklandi",
    data: user,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
};