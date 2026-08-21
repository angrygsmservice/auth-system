const express = require("express");

const auth = require("../middleware/auth");
const {
  createOrder,
  getOrders,
  getServerOrders,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.get("/server", auth, getServerOrders);

module.exports = router;