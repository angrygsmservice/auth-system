const express = require("express");
console.log("AUTH ROUTES LOADED");
const router = express.Router();

const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const authLimiter = require("../middleware/rateLimiter");
const sendResponse = require("../utils/response");

const User = require("../models/User");
const Activity = require("../models/Activity");
const createNotification = require("../utils/createNotification");
const LoginActivity = require("../models/LoginActivity");

const {
  register,
  login,
  refresh,
  changePassword,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changeRole,
  verifyEmail,
  resendVerification,
  getLoginHistory,
  revokeSession,
  revokeAllSessions,
  setupTwoFactor,
  verifyTwoFactor,
  loginWithTwoFactor,
  logoutDevice,
  logoutOtherDevices,
  updateUser,
  uploadAvatar,
} = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
  changePasswordValidation,
} = require("../validation/authValidation");

const validationMiddleware = require("../middleware/validationMiddleware");

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account and sends an email verification link.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Valiyev
 *               email:
 *                 type: string
 *                 example: ali@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post(
  "/register",
  authLimiter,
  registerValidation,
  validationMiddleware,
  register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Login with email and password and receive JWT access and refresh tokens.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxx
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyyyyyyyyyyyyyyyy
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post(
  "/login",
  authLimiter,
  loginValidation,
  validationMiddleware,
  login
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxx
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Forgot password
 *     description: Send OTP to the user's email.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validationMiddleware,
  forgotPassword
);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify OTP
 *     description: Verify the OTP sent to the user's email.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid or expired OTP
 */

router.post(
  "/verify-otp",
  verifyOtpValidation,
  validationMiddleware,
  verifyOTP
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password
 *     description: Reset password using verified OTP.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or request
 */

router.post(
  "/reset-password",
  resetPasswordValidation,
  validationMiddleware,
  resetPassword
);
/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Change password
 *     description: Change password for authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */

router.put(
  "/change-password",
  auth,
  changePasswordValidation,
  validationMiddleware,
  changePassword
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     description: Logout authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */

router.post("/logout", auth, logout);

router.get("/login-history", auth, getLoginHistory);

router.delete("/logout-device/:sessionId", auth, logoutDevice);

router.delete(
  "/logout-other-devices",
  auth,
  logoutOtherDevices
);

router.delete("/sessions/:id", auth, revokeSession);

router.delete("/sessions", auth, revokeAllSessions);

router.post("/2fa/setup", auth, setupTwoFactor);

router.post("/2fa/verify", auth, verifyTwoFactor);

router.post("/2fa/login", loginWithTwoFactor);

/**
 * @swagger
 * /api/v1/auth/verify-email/{token}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verify email
 *     description: Verify user email using verification token.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: 64d8e8a1d9c5a2b123456789
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */

router.get("/verify-email/:token", verifyEmail);

/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Resend verification email
 *     description: Send a new email verification link.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@gmail.com
 *     responses:
 *       200:
 *         description: Verification email sent
 *       404:
 *         description: User not found
 */

router.post("/resend-verification", resendVerification);

/**
 * @swagger
 * /auth/upload-avatar:
 *   post:
 *     tags:
 *       - User
 *     summary: Upload user avatar
 *     description: Upload avatar image for authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/upload-avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar
);

/**
 * @swagger
 * /auth/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     description: Returns a paginated list of users. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *         example: ali
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *         example: newest
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

router.get("/admin/users", auth, admin, async (req, res) => {
  const { search, page = 1, limit = 10, sort } = req.query;

  let filter = {
    isDeleted: false,
  };

  if (search) {
    filter = {
      isDeleted: false,
      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    };
  }

  

  let sortOption = {};
  if (sort === "newest") sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };

  const skip = (page - 1) * limit;

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .select("-password");

  res.json({
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    users,
  });
});

router.get("/admin/deleted-users", auth, admin, async (req, res) => {
  const users = await User.find({
    isDeleted: true,
  })
  .setOptions({ includeDeleted: true })
  .select("-password");
  return res.json({
    success: true,
    users,
  });
});

router.delete("/admin/users/:id", auth, admin, async (req, res) => {
  try {
    console.log("========== DELETE ROUTE ISHLADI ==========");
    console.log("PARAM:", req.params.id);

    const checkUser = await User.findById(req.params.id);
    console.log("CHECK USER:", checkUser);

    if (!checkUser) {
      console.log("USER TOPILMADI");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      {
        returnDocument: "after",
      }
    );

    console.log("UPDATED USER:", user);

    await Activity.create({
      admin: req.user.id,
      targetUser: user._id,
      action: "delete",
      description: `Deleted user ${user.name}`,
    });

    console.log("ACTIVITY CREATED");

    await createNotification(
      "User Deleted",
      `${user.name} was deleted by admin`,
      "delete"
    );

    console.log("NOTIFICATION CREATED");

    return sendResponse(
      res,
      200,
      true,
      "User deleted successfully"
    );
  } catch (err) {
    console.log("========== DELETE ERROR ==========");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * @swagger
 * /auth/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete user
 *     description: Delete a user by ID. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 68657c2d7dbe6c9a12345678
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */


/**
 * @swagger
 * /auth/admin/users/restore/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Restore deleted user
 *     description: Restore a soft deleted user. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 68657c2d7dbe6c9a12345678
 *     responses:
 *       200:
 *         description: User restored successfully
 *       404:
 *         description: User not found
 */

router.get("/admin/user-registrations", auth, admin, async (req, res) => {
  const data = await User.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },

    {
      $group: {
        _id: {
          $month: "$createdAt",
        },
        users: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  res.json({
    success: true,
    data,
  });
});

router.get("/admin/activities", auth, admin, async (req, res) => {
  const activities = await Activity.find()
    .populate("admin", "name")
    .populate("targetUser", "name")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    activities,
  });
});

/**
 * @swagger
 * /auth/admin/users/{id}/role:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Change user role
 *     description: Change a user's role to admin or user. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 68657c2d7dbe6c9a12345678
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: sttring
 *                 enum:
 *                   - user
 *                   - admin
 *                 example: admin
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       404:
 *         description: User not found
 */

router.put("/admin/users/:id/role", auth, admin, changeRole);

router.put("/admin/users/:id/balance", auth, admin, async (req, res) => {
  try {
    const { amount } = req.body;

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid balance amount",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          balance: numericAmount,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Balance added successfully",
      data: user,
    });
  } catch (error) {
    console.error("ADD BALANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add balance",
      error: error.message,
    });
  }
});

router.put("/admin/users/:id", auth, admin, updateUser);

router.put("/admin/restore-user/:id", auth, admin, async (req, res) => {
  try {
    console.log("RESTORE PARAM:", req.params.id);

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        isDeleted: false,
      },
      {
        new: true,
      }
    ).setOptions({ includeDeleted: true });

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Activity.create({
      admin: req.user.id,
      targetUser: user._id,
      action: "restore",
      description: `Restored user ${user.name}`,
    });

    await createNotification(
      "User Restored",
      `${user.name} was restored by admin`,
      "restore"
    );

    return sendResponse(
      res,
      200,
      true,
      "User restored successfully"
    );
  } catch (err) {
    console.error("RESTORE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/test", (req, res) => {
  res.json({
    message: "Auth route works"
  });
});

module.exports = router;