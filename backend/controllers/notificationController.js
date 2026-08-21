const Notification = require("../models/Notification");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const getNotifications = async (req, res) => {
  try {
    console.log("CONTROLLER HIT");

    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    console.log("NOTIFICATIONS:", notifications);

    res.status(200).json({
      success: true,
      data: notifications,
    });

  } catch (error) {
    console.log("CONTROLLER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportNotificationsExcel = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Notifications");

    worksheet.columns = [
      {
        header: "ID",
        key: "_id",
        width: 30,
      },
      {
        header: "Title",
        key: "title",
        width: 30,
      },
      {
        header: "Message",
        key: "message",
        width: 50,
      },
      {
        header: "Created At",
        key: "createdAt",
        width: 25,
      },
    ];

    notifications.forEach((notification) => {
      worksheet.addRow(notification);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=notifications.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportNotificationsPDF = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=notifications.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18)
      .text("Notifications Report");

    notifications.forEach((notification, index) => {
      doc.moveDown();

      doc.fontSize(12)
        .text(`${index + 1}. ${notification.title}`);

      doc.fontSize(10)
        .text(notification.message);

      doc.text(
        `Date: ${notification.createdAt}`
      );
    });

    doc.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  exportNotificationsExcel,
  exportNotificationsPDF,
};