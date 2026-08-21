const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

const User = require("../models/User");

const {
  getProfile,
  updateProfile,
  uploadAvatar,
} = require("../controllers/userController");

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user profile
 *     description: Returns authenticated user's profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", auth, getProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     tags:
 *       - User
 *     summary: Update current user profile
 *     description: Update authenticated user's profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", auth, updateProfile);

/**
 * @swagger
 * /api/v1/users/avatar:
 *   post:
 *     tags:
 *       - User
 *     summary: Upload avatar
 *     description: Upload authenticated user's avatar.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     description: Returns all users (Admin only).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users returned successfully
 *       403:
 *         description: Forbidden
 */
router.get("/", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
});

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create user
 *     description: Create a new user (Admin only).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Forbidden
 */
router.post("/", auth, admin, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || "user",
      status: req.body.status || "active",
    });

    const savedUser = await user.save();

    const responseUser = savedUser.toObject();

    delete responseUser.password;

    res.status(201).json(responseUser);
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user
 *     description: Update user by ID (Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Shukrona
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               role:
 *                 type: string
 *                 enum:
 *                   - user
 *                   - admin
 *                 example: user
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - suspended
 *                 example: suspended
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid user data
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put("/:id", auth, admin, async (req, res) => {
  try {
    console.log("========== UPDATE USER ==========");
    console.log("REQ.PARAMS:", req.params);
    console.log("REQ.BODY:", req.body);

    const { name, email, role, status } = req.body;

    // Role validation
    if (role !== undefined && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Status validation
    if (
      status !== undefined &&
      !["active", "suspended"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    console.log("UPDATED USER FROM DB:", updated);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete user
 *     description: Delete user by ID (Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

/**
 * ADMIN ADD BALANCE
 */
router.put("/:id/balance", auth, admin, async (req, res) => {
  try {
    const { amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid balance amount",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.balance += amount;

    await user.save();

    res.json({
      success: true,
      message: "Balance added successfully",
      data: {
        userId: user._id,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("ADD BALANCE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add balance",
    });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
});

module.exports = router;