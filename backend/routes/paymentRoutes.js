const express = require("express");

const {
  createDeposit,
} = require("../controllers/paymentController");

const auth = require("../middleware/auth");

const router = express.Router();

// =====================================================
// USER: CREATE DEPOSIT
// =====================================================

router.post(
  "/deposit",
  auth,
  createDeposit
);

module.exports = router;