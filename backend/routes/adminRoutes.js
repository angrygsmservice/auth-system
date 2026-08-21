const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getDashboardStats,
  getRecentLogins,
  getActivities,
  getUserRegistrations,
} = require("../controllers/adminController");

const {
  getAllOrders,
} = require("../controllers/adminOrderController");

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get dashboard statistics
 *     description: Returns admin dashboard statistics.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics returned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard",
  auth,
  admin,
  getDashboardStats
);

router.get(
  "/recent-logins",
  auth,
  admin,
  getRecentLogins
);

router.get(
  "/activities",
  auth,
  admin,
  getActivities
);

router.get(
  "/user-registrations",
  auth,
  admin,
  getUserRegistrations
);

router.get(
  "/orders",
  auth,
  admin,
  getAllOrders
);

module.exports = router;