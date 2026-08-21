const express = require("express");

const {
  createDeposit,
} = require("../controllers/depositController");

const auth = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  auth,
  createDeposit
);

module.exports = router;