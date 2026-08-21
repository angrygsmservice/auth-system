const express = require("express");
const router = express.Router();

const {
  createRentOrder,
  getMyRentOrders,
  getRentOrders,
  updateRentOrderStatus,
  updateRentOrderCredentials,
} = require("../controllers/rentController");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

/**
 * @swagger
 * tags:
 *   name: Rent
 *   description: Rent order management
 */

/**
 * @swagger
 * /api/v1/rent:
 *   get:
 *     summary: Get current user's rent orders
 *     tags: [Rent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User rent orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", auth, getMyRentOrders);

/**
 * @swagger
 * /api/v1/rent/admin:
 *   get:
 *     summary: Get all rent orders for admin
 *     tags: [Rent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All rent orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get(
  "/admin",
  auth,
  adminOnly,
  getRentOrders
);

/**
 * @swagger
 * /api/v1/rent:
 *   post:
 *     summary: Create a rent order
 *     tags: [Rent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: "6a7c3ed8cf0612c7d144e0e6"
 *     responses:
 *       201:
 *         description: Rent order created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  auth,
  createRentOrder
);

/**
 * @swagger
 * /api/v1/rent/{id}/status:
 *   put:
 *     summary: Update rent order status
 *     tags: [Rent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6a7d131da12b0d8536f84353"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - active
 *                   - completed
 *                   - cancelled
 *                 example: active
 *     responses:
 *       200:
 *         description: Rent order status updated successfully
 *       400:
 *         description: Invalid rent order status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Rent order not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/status",
  auth,
  adminOnly,
  updateRentOrderStatus
);

/**
 * @swagger
 * /api/v1/rent/{id}/credentials:
 *   put:
 *     summary: Update rent order credentials
 *     tags: [Rent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6a7d131da12b0d8536f84353"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - password
 *             properties:
 *               login:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "Xxxxxx123"
 *               note:
 *                 type: string
 *                 example: "DFT account"
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - active
 *                   - completed
 *                   - cancelled
 *                 example: completed
 *     responses:
 *       200:
 *         description: Rent credentials updated successfully
 *       400:
 *         description: Invalid credentials or status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Rent order not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/credentials",
  auth,
  adminOnly,
  updateRentOrderCredentials
);

module.exports = router;