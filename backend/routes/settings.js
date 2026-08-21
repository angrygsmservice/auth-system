const express = require("express");
const router = express.Router();

const {
  getSettings,
  toggleMaintenance,
} = require("../controllers/settingsController");

router.get("/", getSettings);

router.put("/maintenance", toggleMaintenance);

module.exports = router;