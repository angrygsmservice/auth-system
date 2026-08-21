const express = require("express");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/adminOrderController");

const router = express.Router();

router.get(
  "/",
  auth,
  admin,
  (req, res, next) => {
    console.log("🔥🔥🔥 ADMIN ORDER ROUTE HIT 🔥🔥🔥");
    next();
  },
  getAllOrders
);

router.put(
  "/:id/status",
  auth,
  admin,
  updateOrderStatus
);

module.exports = router;