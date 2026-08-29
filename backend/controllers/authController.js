const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");
const Settings = require("../models/Settings");
const Session = require("../models/Session");
const Activity = require("../models/Activity");
const UAParser = require("ua-parser-js");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("../middleware/asyncHandler");
const sendResponse = require("../utils/response");
const LoginActivity = require("../models/LoginActivity");
const createNotification = require("../utils/createNotification");

const register = asyncHandler(async (req, res) => {
  console.log("========== REGISTER START ==========");
  console.log("REQ BODY:", req.body);

  const { name, email: rawEmail, password } = req.body;

  if (!name || !rawEmail || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  const email = rawEmail.trim().toLowerCase();

  console.log("NORMALIZED EMAIL:", email);

  const existingUser = await User.findOne({ email })
    .setOptions({ includeDeleted: true });

  console.log(
    "EXISTING USER:",
    existingUser ? "YES" : "NO"
  );

  if (existingUser && !existingUser.isDeleted) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  console.log("BEFORE BCRYPT HASH");

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("AFTER BCRYPT HASH");

  const verificationToken = crypto
    .randomBytes(32)
    .toString("hex");

  if (existingUser && existingUser.isDeleted) {
    console.log(
      "RESTORING DELETED USER:",
      existingUser._id
    );

    existingUser.name = name;
    existingUser.email = email;
    existingUser.password = hashedPassword;
    existingUser.isDeleted = false;
    existingUser.isVerified = false;
    existingUser.verificationToken = verificationToken;
    existingUser.verificationExpire =
      Date.now() + 1000 * 60 * 60;

    existingUser.status = "active";
    existingUser.refreshToken = "";
    existingUser.resetOTP = "";
    existingUser.resetOTPExpire = null;
    existingUser.twoFactorEnabled = false;
    existingUser.twoFactorSecret = "";

    console.log("BEFORE USER SAVE");

    await existingUser.save();

    console.log("AFTER USER SAVE:", existingUser._id);

    const verificationLink =
        `https://backend-ten-dusky-24.vercel.app/api/v1/auth/verify-email/${verificationToken}`;

    console.log("VERIFICATION TOKEN:", verificationToken);
    console.log("VERIFICATION LINK:", verificationLink);

    console.log("BEFORE SEND EMAIL");

    await sendEmail(
    existingUser.email,
    "Email Verification",
    `Please click the link below to verify your email:

  ${verificationLink}

  This verification link will expire in 1 hour.`
  );

  console.log("VERIFICATION EMAIL SENT:", existingUser.email);

  return sendResponse(
    res,
    201,
    true,
    "Registration successful. Please verify your email."
  );
}

  const user = new User({
    name,
    email,
    password: hashedPassword,
    verificationToken,
    verificationExpire:
      Date.now() + 1000 * 60 * 60,
  });

  await user.save();

  console.log("USER SAVED:", user._id);
  console.log("SAVED VERIFICATION TOKEN:", user.verificationToken);

  const verificationLink =
      `https://backend-ten-dusky-24.vercel.app/api/v1/auth/verify-email/${verificationToken}`;

  console.log("VERIFICATION TOKEN:", verificationToken);
  console.log("VERIFICATION LINK:", verificationLink);

  await sendEmail(
    user.email,
    "Email Verification",
    `Please click the link below to verify your email:

  ${verificationLink}

  This verification link will expire in 1 hour.`
  );

  console.log("VERIFICATION EMAIL SENT:", user.email);

  return sendResponse(
    res,
    201,
    true,
    "Registration successful. Please verify your email."
  );
});
  
const login = asyncHandler(async (req, res) => {
  console.log("========== LOGIN START ==========");
  console.log("REQ BODY:", req.body);

  const user = await User.findOne({
    email: req.body.email,
  }).select("+password");

  console.log("========== USER QUERY DONE ==========");
  console.log("FOUND USER:", !!user);

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  console.log("USER VERIFIED:", user.isVerified);
  console.log("USER STATUS:", user.status);

  if (!user.isVerified) {
    return res.status(403).json({
      message: "Please verify your email before logging in",
    });
  }

  if (user.status === "suspended") {
    return res.status(403).json({
      message: "Account suspended",
    });
  }

  console.log("========== BEFORE BCRYPT ==========");

  const isMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );

  console.log("========== BCRYPT DONE ==========");
  console.log("PASSWORD MATCH:", isMatch);

  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid password",
    });
  }

  console.log("========== BEFORE SETTINGS ==========");

  const settings = await Settings.findOne();

  console.log("========== SETTINGS DONE ==========");
  console.log(settings);

  if (
    settings?.maintenanceMode &&
    user.role !== "admin"
  ) {
    return res.status(503).json({
      message: "Website is under maintenance.",
    });
  }

  console.log("========== BEFORE JWT ==========");

  const accessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  console.log("ACCESS TOKEN CREATED");

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );

  console.log("REFRESH TOKEN CREATED");

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;

  console.log("========== BEFORE USER SAVE ==========");

  await user.save();

  console.log("========== USER SAVE DONE ==========");

  // =================================================
  // CREATE LOGIN SESSION
  // =================================================

  const parser = new UAParser(
    req.headers["user-agent"]
  );

  const result = parser.getResult();

  await Session.create({
    user: user._id,
    refreshToken: hashedRefreshToken,
    device: result.device.type || "Desktop",
    browser: result.browser.name || "Unknown Browser",
    os: result.os.name || "Unknown OS",
    ipAddress: req.ip,
    isActive: true,
  });

  console.log("LOGIN SESSION CREATED");

  res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

  console.log("REFRESH TOKEN COOKIE SET");

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name
      },
      {
        new: true
      }
    ).select("-password");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    console.log("🔥 CHANGE PASSWORD ISHLADI");
    console.log("REQ.USER:", req.user);
    console.log("BODY:", req.body);

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    console.log("USER FOUND:", user.email);

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    console.log("MATCH:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.json({
      message: "Password updated successfully"
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: err.message
    });
  }
};

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await Session.findOneAndUpdate(
      {
        user: req.user.id,
        refreshToken: hashedToken,
        isActive: true,
      },
      {
        isActive: false,
        logoutAt: new Date(),
      }
    );
  }

  const user = await User.findById(req.user.id);

  if (user) {
    const hashedToken = refreshToken
      ? crypto
          .createHash("sha256")
          .update(refreshToken)
          .digest("hex")
      : null;

    if (hashedToken && user.refreshToken === hashedToken) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return sendResponse(
    res,
    200,
    true,
    "Logged out successfully"
  );
});


const forgotPassword = asyncHandler(async (req, res) => {

  const user = await User.findOne({
    email: req.body.email
  });


  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }


  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();


  user.resetOTP = otp;

  user.resetOTPExpire =
    Date.now() + 10 * 60 * 1000;


  await user.save();


  await sendEmail(
    user.email,
    "Password Reset OTP",
    `Your password reset verification code is: ${otp}`
  );


  return sendResponse(
    res,
    200,
    true,
    "Password reset email has been sent"
  );

});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  console.log("BODY OTP:", otp);
  console.log("USER:", user);

  if (!user) {
    return res.status(404).json({
      message: "User topilmadi"
    });
  }

  console.log("BODY OTP:", otp);
  console.log("DB OTP:", user.resetOTP);

  if (user.resetOTP !== otp) {
    return res.status(400).json({
      message: "Invalid OTP"
    });
  }

  if (user.resetOTPExpire < Date.now()) {
    return res.status(400).json({
      message: "OTP has expired"
    });
  }

  return sendResponse(
    res,
    200,
    true,
    "OTP verified successfully"
  );
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token not found",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findOne({
    refreshToken: hashedToken,
    isActive: true,
  }).populate("user");

  if (!session) {
    return res.status(401).json({
      message: "Session is no longer active",
    });
  }

  const user = session.user;

  if (!user) {
    return res.status(401).json({
      message: "User not found",
    });
  }

  if (user.status === "suspended") {
    return res.status(403).json({
      message: "Account suspended",
    });
  }

  if (user.isDeleted) {
    return res.status(403).json({
      message: "Account deleted",
    });
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const newRefreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const hashedNewRefreshToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshToken = hashedNewRefreshToken;
  await user.save();

  session.refreshToken = hashedNewRefreshToken;
  session.lastActivity = new Date();

  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: "Token refreshed successfully",
    accessToken,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      message: "Email, OTP va yangi parol kerak"
    });
  }

  const user = await User.findOne({ email });

  console.log("BODY OTP:", otp);
  console.log("DB OTP:", user.resetOTP);

  if (!user) {
    return res.status(404).json({
      message: "User topilmadi"
    });
  }

  if (user.resetOTP !== otp) {
    return res.status(400).json({
      message: "OTP noto'g'ri"
    });
  }

  if (user.resetOTPExpire < Date.now()) {
    return res.status(400).json({
      message: "OTP muddati tugagan"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  user.resetOTP = "";
  user.resetOTPExpire = null;

  await user.save();

  return sendResponse(
    res,
    200,
    true,
    "Password reset successfully"
  );
});

const changeRole = asyncHandler(async (req, res) => {
  console.log("========== CHANGE ROLE ==========");
  console.log("REQ.PARAMS:", req.params);
  console.log("REQ.BODY:", req.body);

  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role is required",
    });
  }

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Admin o'zining rolini user qila olmaydi
  if (
    req.user.id.toString() === user._id.toString() &&
    role === "user"
  ) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own role.",
    });
  }

  const oldRole = user.role;

  user.role = role;
  await user.save();

  await Activity.create({
    admin: req.user.id,
    targetUser: user._id,
    action: "change-role",
    description: `Changed ${user.name}'s role from ${oldRole} to ${role}`,
    status: "completed",
  });

  await createNotification(
    "Role Updated",
    `${user.name}'s role was changed from ${oldRole} to ${role}`,
    "role"
  );

  const updatedUser = await User.findById(user._id).select("-password");

  return res.status(200).json({
    success: true,
    message: "Role updated successfully",
    data: updatedUser,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  console.log("========== UPDATE USER ==========");
  console.log("REQ.PARAMS:", req.params);
  console.log("REQ.BODY:", req.body);

  const { name, email, role, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required",
    });
  }

  if (
    role !== undefined &&
    !["user", "admin"].includes(role)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  if (
    status !== undefined &&
    !["active", "suspended"].includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.name = name;
  user.email = email;

  if (role !== undefined) {
    user.role = role;
  }

  if (status !== undefined) {
    user.status = status;
  }

  await user.save();

  await Activity.create({
    admin: req.user.id,
    targetUser: user._id,
    action: "update-user",
    description: `Updated user ${user.name}`,
    status: "completed",
  });

  const updatedUser = await User.findById(user._id)
    .select("-password");

  console.log("UPDATED USER FROM DB:", updatedUser);

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    verificationToken: req.params.token
  }).setOptions({ includeDeleted: true });

  if (!user) {
    return res.status(404).json({
      message: "Invalid verification token"
    });
  }

  if (user.verificationExpire < Date.now()) {
    return res.status(400).json({
      message: "Verification token has expired"
    });
  }

  user.isVerified = true;
  user.verificationToken = "";
  user.verificationExpire = null;

  await user.save();

  return sendResponse(
    res,
    200,
    true,
    "Email verified successfully"
  );
});

const resendVerification = asyncHandler(async (req, res) => {
  console.log("REQ BODY:", req.body);

  const { email } = req.body;
  console.log("EMAIL:", email);

  const user = await User.findOne({ email });
  console.log("USER:", user);

  if (!user) {
    return res.status(404).json({
      message: "User topilmadi"
    });
  }

  if (user.isVerified) {
    return res.status(400).json({
      message: "Email is already verified"
    });
  }

  const verificationToken = crypto
    .randomBytes(32)
    .toString("hex");

  user.verificationToken = verificationToken;
  user.verificationExpire = Date.now() + 1000 * 60 * 60;

  await user.save();

  const verificationLink =
      `https://backend-ten-dusky-24.vercel.app/api/v1/auth/verify-email/${verificationToken}`;

  console.log("VERIFICATION TOKEN:", verificationToken);
  console.log("VERIFICATION LINK:", verificationLink);

  await sendEmail(
    user.email,
    "Email Verification",
    `Please click the link below to verify your email:

${verificationLink}

This verification link will expire in 1 hour.`
  );

  return sendResponse(
    res,
    200,
    true,
    "A new verification email has been sent"
  );
});

const setupTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  const secret = speakeasy.generateSecret({
    name: `Auth System (${user.email})`,
  });

  user.twoFactorSecret = secret.base32;

  await user.save();

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return sendResponse(
    res,
    200,
    true,
    "2FA setup initialized",
    {
      qrCode,
      secret: secret.base32,
    }
  );
});

const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findById(req.user.id);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return sendResponse(
      res,
      400,
      false,
      "Invalid 2FA code"
    );
  }

  user.twoFactorEnabled = true;
  await user.save();

  return sendResponse(
    res,
    200,
    true,
    "2FA enabled successfully"
  );
});

const disableTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.twoFactorEnabled = false;
  user.twoFactorSecret = "";

  await user.save();

  return sendResponse(
    res,
    200,
    true,
    "2FA disabled successfully"
  );
});

const loginWithTwoFactor = asyncHandler(async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return sendResponse(
      res,
      400,
      false,
      "Email and 2FA code are required"
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return sendResponse(
      res,
      404,
      false,
      "User not found"
    );
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return sendResponse(
      res,
      400,
      false,
      "Two-factor authentication is not enabled"
    );
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: token.trim(),
    window: 1,
  });

  if (!verified) {
    return sendResponse(
      res,
      400,
      false,
      "Invalid 2FA code"
    );
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedRefreshToken;

  await user.save();

  const parser = new UAParser(
    req.headers["user-agent"]
  );

  const result = parser.getResult();

  await Session.create({
    user: user._id,
    refreshToken: hashedRefreshToken,
    device: result.device.type || "Desktop",
    browser: result.browser.name || "Unknown Browser",
    os: result.os.name || "Unknown OS",
    ipAddress: req.ip,
    isActive: true,
  });

  await LoginActivity.create({
    user: user._id,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendResponse(
    res,
    200,
    true,
    "Login successful",
    {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    }
  );
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User topilmadi"
    });
  }

  user.avatar = "/uploads/" + req.file.filename;

  await user.save();

  res.json({
    message: "Avatar uploaded successfull",
    avatar: user.avatar
  });
});

const getLoginHistory = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;

  let currentHash = null;

  if (currentRefreshToken) {
    currentHash = crypto
      .createHash("sha256")
      .update(currentRefreshToken)
      .digest("hex");
  }

  const sessions = await Session.find({
    user: req.user.id,
  })
    .sort({ createdAt: -1 })
    .select(
      "device browser os ipAddress isActive createdAt logoutAt lastActivity"
    );

  const data = sessions.map((session) => ({
    id: session._id,
    device: session.device,
    browser: session.browser,
    os: session.os,
    ipAddress: session.ipAddress,
    isActive: session.isActive,
    createdAt: session.createdAt,
    logoutAt: session.logoutAt,
    lastActivity: session.lastActivity,
    current: false,
  }));

  if (currentHash) {
    const currentSession = await Session.findOne({
      user: req.user.id,
      refreshToken: currentHash,
      isActive: true,
    }).select("_id");

    if (currentSession) {
      const currentItem = data.find(
        (item) =>
          item.id.toString() ===
          currentSession._id.toString()
      );

      if (currentItem) {
        currentItem.current = true;
      }
    }
  }

  return sendResponse(
    res,
    200,
    true,
    "Login history fetched successfully",
    data
  );
});

  const logoutDevice = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      session.user.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to logout this device",
      });
    }

    const currentRefreshToken = req.cookies.refreshToken;

    let isCurrentSession = false;

    if (currentRefreshToken) {
      const currentHash = crypto
        .createHash("sha256")
        .update(currentRefreshToken)
        .digest("hex");

      isCurrentSession =
        session.refreshToken === currentHash;
    }

    session.isActive = false;
    session.logoutAt = new Date();

    await session.save();

    if (isCurrentSession) {
      const user = await User.findById(req.user.id);

      if (user) {
        user.refreshToken = null;
        await user.save();
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
      });
    }

    return res.json({
      success: true,
      message: "Device logged out successfully",
    });
  });

const logoutOtherDevices = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;

  if (!currentRefreshToken) {
    return res.status(401).json({
      message: "Refresh token not found",
    });
  }

  const currentHash = crypto
    .createHash("sha256")
    .update(currentRefreshToken)
    .digest("hex");

  await Session.updateMany(
    {
      user: req.user.id,
      refreshToken: { $ne: currentHash },
      isActive: true,
    },
    {
      isActive: false,
      logoutAt: new Date(),
    }
  );

  return res.json({
    success: true,
    message: "Other devices logged out successfully",
  });
});

const revokeSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    return res.status(404).json({
      message: "Session not found",
    });
  }

  if (session.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      message: "You cannot revoke this session",
    });
  }

  const currentRefreshToken = req.cookies.refreshToken;

  let isCurrentSession = false;

  if (currentRefreshToken) {
    const currentHash = crypto
      .createHash("sha256")
      .update(currentRefreshToken)
      .digest("hex");

    isCurrentSession =
      session.refreshToken === currentHash;
  }

  session.isActive = false;
  session.logoutAt = new Date();

  await session.save();

  if (isCurrentSession) {
    const user = await User.findById(req.user.id);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });
  }

  return sendResponse(
    res,
    200,
    true,
    "Session revoked successfully"
  );
});

const revokeAllSessions = asyncHandler(async (req, res) => {
  await Session.updateMany(
    {
      user: req.user.id,
      isActive: true,
    },
    {
      isActive: false,
      logoutAt: new Date(),
    }
  );

  const user = await User.findById(req.user.id);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return sendResponse(
    res,
    200,
    true,
    "Logged out from all devices successfully"
  );
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  changeRole,
  updateUser,
  updateProfile,
  getProfile,
  verifyEmail,
  resendVerification,
  uploadAvatar,
  getLoginHistory,
  revokeSession,
  revokeAllSessions,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  loginWithTwoFactor,
  logoutDevice,
  logoutOtherDevices,
};