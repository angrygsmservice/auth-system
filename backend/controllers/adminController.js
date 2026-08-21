const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");
const Activity = require("../models/Activity");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      isDeleted: false,
    });

    const admins = await User.countDocuments({
      role: "admin",
      isDeleted: false,
    });

    const normalUsers = await User.countDocuments({
      role: "user",
      isDeleted: false,
    });

    const twoFactorEnabled = await User.countDocuments({
      twoFactorEnabled: true,
      isDeleted: false,
    });

    const twoFactorDisabled = await User.countDocuments({
      twoFactorEnabled: false,
      isDeleted: false,
    });

    const deletedUsers = await User.countDocuments({
      isDeleted: true,
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayRegistrations = await User.countDocuments({
      createdAt: {
        $gte: startOfToday,
      },
      isDeleted: false,
    });

    const todayLogins = await LoginActivity.countDocuments({
      createdAt: {
        $gte: startOfToday,
      },
    });

    const activeUsers = await User.countDocuments({
      isDeleted: false,
      isVerified: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        admins,
        normalUsers,
        twoFactorEnabled,
        twoFactorDisabled,
        deletedUsers,
        todayRegistrations,
        todayLogins,
        activeUsers,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getRecentLogins = async (req, res) => {
  try {
    console.log("RECENT LOGIN API ISHLADI");

    const logins = await LoginActivity.find()
      .populate("user", "name email role avatar")
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("LOGIN COUNT:", logins.length);
    console.log(logins);

    return res.status(200).json({
      success: true,
      data: logins,
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("admin", "name email avatar")
      .populate("targetUser", "name email role avatar")
      .sort({ createdAt: -1 });

    console.log(
      "ACTIVITY ADMINS:",
      activities.map((activity) => ({
        name: activity.admin?.name,
        avatar: activity.admin?.avatar,
      }))
    );

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load activities",
    });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email role avatar"
      )
      .populate(
        "service",
        "name description category price duration durationMin durationMax durationUnit status"
      )
      .populate(
        "repliedBy",
        "name email role avatar"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (err) {
    console.error(
      "GET ADMIN ORDERS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load orders",
    });
  }
};

const getUserRegistrations = async (req, res) => {
  try {
    const registrations = await User.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          users: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (err) {
    console.error(
      "USER REGISTRATIONS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load user registrations",
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentLogins,
  getActivities,
  getAdminOrders,
  getUserRegistrations,
};