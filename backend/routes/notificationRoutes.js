const express = require("express");
const router = express.Router();

const {
  getNotifications,
  exportNotificationsExcel,
  exportNotificationsPDF,
} = require("../controllers/notificationController");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


// Notification test
router.get("/", (req, res, next) => {
  console.log("NOTIFICATION ROUTE HIT");
  next();
});


// Get notifications
router.get("/", getNotifications);


// Export Excel (faqat admin)
router.get(
  "/export/excel",
  auth,
  admin,
  exportNotificationsExcel
);


// Export PDF (faqat admin)
router.get(
  "/export/pdf",
  auth,
  admin,
  exportNotificationsPDF
);


module.exports = router;