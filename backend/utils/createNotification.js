const Notification = require("../models/Notification");

const createNotification = async (title, message, type = "create") => {
  console.log("CREATE NOTIFICATION ISHLADI");

  try {
    const notification = await Notification.create({
      title,
      message,
      type,
    });

    console.log(notification);
  } catch (error) {
    console.log(error);
  }
};

module.exports = createNotification;