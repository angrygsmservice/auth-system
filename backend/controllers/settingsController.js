const Settings = require("../models/Settings");

// Settingsni olish
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        maintenanceMode: false,
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Maintenance Mode ni o'zgartirish
exports.toggleMaintenance = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        maintenanceMode: false,
      });
    }

    settings.maintenanceMode = !settings.maintenanceMode;

    await settings.save();

    res.json({
      success: true,
      message: "Maintenance mode updated.",
      data: settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};