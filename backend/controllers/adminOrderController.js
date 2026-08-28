const Order = require("../models/Order");
const RentOrder = require("../models/rentOrder");

// =====================================================
// ADMIN: GET ALL ORDERS
// Includes normal orders + rent orders
// =====================================================

const getAllOrders = async (req, res) => {
  console.log("\n====================================");
  console.log("🔥🔥🔥 ADMIN ORDER CONTROLLER HIT 🔥🔥🔥");
  console.log("====================================");

  try {
    // ===================================================
    // CHECK MODELS
    // ===================================================

    console.log("1️⃣ ORDER MODEL:", Order.modelName);
    console.log("2️⃣ RENT ORDER MODEL:", RentOrder.modelName);

    // ===================================================
    // NORMAL ORDERS
    // ===================================================

    const normalOrders = await Order.find()
      .populate("user", "name email")
      .populate("service", "name category price")
      .sort({ createdAt: -1 });

    console.log(
      "3️⃣ NORMAL ORDERS COUNT:",
      normalOrders.length
    );

    // ===================================================
    // RENT ORDERS
    // ===================================================

    console.log("4️⃣ SEARCHING RENT ORDERS...");

    const rentOrders = await RentOrder.find()
      .populate("user", "name email")
      .populate(
        "service",
        "name description category price durationMin durationMax durationUnit"
      )
      .sort({ createdAt: -1 });

    console.log(
      "5️⃣ RENT ORDERS COUNT:",
      rentOrders.length
    );

    // ===================================================
    // FORMAT RENT ORDERS
    // ===================================================

    const formattedRentOrders = rentOrders.map((order) => ({
      ...order.toObject(),

      orderType: "rent",

      duration: order.duration,
      durationUnit: order.durationUnit,

      startTime: order.startTime,
      endTime: order.endTime,

      status: order.status,

      adminReply: order.adminReply || "",

      credentials: {
        login: order.credentials?.login || "",
        password: order.credentials?.password || "",
        note: order.credentials?.note || "",
      },

      user: order.user,
      service: order.service,
    }));

    console.log(
      "6️⃣ FORMATTED RENT ORDERS:",
      formattedRentOrders.length
    );

    // ===================================================
    // FORMAT NORMAL ORDERS
    // ===================================================

    const formattedNormalOrders = normalOrders.map(
      (order) => ({
        ...order.toObject(),

        orderType: "normal",

        adminReply: order.adminReply || "",
      })
    );

    console.log(
      "7️⃣ FORMATTED NORMAL ORDERS:",
      formattedNormalOrders.length
    );

    // ===================================================
    // COMBINE
    // ===================================================

    const allOrders = [
      ...formattedNormalOrders,
      ...formattedRentOrders,
    ];

    // ===================================================
    // SORT NEWEST FIRST
    // ===================================================

    allOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    // ===================================================
    // DEBUG
    // ===================================================

    console.log("====================================");
    console.log("🔥 ADMIN ALL ORDERS");
    console.log(
      "NORMAL ORDERS:",
      normalOrders.length
    );
    console.log(
      "RENT ORDERS:",
      rentOrders.length
    );
    console.log(
      "TOTAL ORDERS:",
      allOrders.length
    );

    console.log("ORDER TYPES:");

    console.log(
      allOrders.map((order) => ({
        id: order._id,
        type: order.orderType,
        service: order.service?.name,
        user: order.user?.email,
        status: order.status,
      }))
    );

    console.log("====================================\n");

    // ===================================================
    // RESPONSE
    // ===================================================

    return res.status(200).json({
      success: true,
      data: allOrders,
    });

  } catch (error) {
    console.error(
      "❌ GET ALL ADMIN ORDERS ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// ADMIN: UPDATE ORDER
// Supports normal + rent orders
// =====================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      adminReply,
      login,
      password,
      note,
    } = req.body;

    console.log("\n====================================");
    console.log("🔥 ADMIN UPDATE ORDER");
    console.log("ORDER ID:", id);
    console.log("STATUS:", status);
    console.log("ADMIN REPLY:", adminReply);
    console.log("LOGIN PROVIDED:", login !== undefined);
    console.log("PASSWORD PROVIDED:", password !== undefined);
    console.log("NOTE PROVIDED:", note !== undefined);
    console.log("====================================");

    // ===================================================
    // FIND ORDER
    // ===================================================

    let order = await Order.findById(id);

    let orderType = "normal";

    // ===================================================
    // IF NOT NORMAL → TRY RENT
    // ===================================================

    if (!order) {
      order = await RentOrder.findById(id);
      orderType = "rent";
    }

    // ===================================================
    // NOT FOUND
    // ===================================================

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order topilmadi",
      });
    }

    // ===================================================
    // STATUS VALIDATION
    // ===================================================

    const normalStatuses = [
      "pending",
      "processing",
      "completed",
      "cancelled",
    ];

    const rentStatuses = [
      "pending",
      "active",
      "completed",
      "cancelled",
    ];

    const allowedStatuses =
      orderType === "rent"
        ? rentStatuses
        : normalStatuses;

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          orderType === "rent"
            ? "Invalid rent order status. Allowed: pending, active, completed, cancelled"
            : "Invalid order status. Allowed: pending, processing, completed, cancelled",
      });
    }

    // ===================================================
    // ADMIN REPLY
    // ===================================================

    order.adminReply =
      typeof adminReply === "string"
        ? adminReply.trim()
        : "";

    // ===================================================
    // REPLY INFORMATION
    // ===================================================

    if (
      Object.prototype.hasOwnProperty.call(
        order,
        "repliedAt"
      )
    ) {
      order.repliedAt = new Date();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        order,
        "repliedBy"
      )
    ) {
      order.repliedBy = req.user.id;
    }

    // ===================================================
    // STATUS
    // ===================================================

    order.status = status;

    // ===================================================
    // CANCEL REASON
    // ===================================================

    if (status === "cancelled") {
      if (
        Object.prototype.hasOwnProperty.call(
          order,
          "cancelReason"
        )
      ) {
        order.cancelReason =
          "Cancelled by admin";
      }
    }

    // ===================================================
    // RENT CREDENTIALS
    // =====================================================

    if (orderType === "rent") {
      const hasLogin =
        login !== undefined;

      const hasPassword =
        password !== undefined;

      const hasNote =
        note !== undefined;

      // -----------------------------------------------
      // If any credential field is sent,
      // update credentials
      // -----------------------------------------------

      if (
        hasLogin ||
        hasPassword ||
        hasNote
      ) {
        const currentCredentials =
          order.credentials || {};

        order.credentials = {
          login:
            hasLogin
              ? String(login || "").trim()
              : currentCredentials.login || "",

          password:
            hasPassword
              ? String(password || "").trim()
              : currentCredentials.password || "",

          note:
            hasNote
              ? String(note || "").trim()
              : currentCredentials.note || "",
        };
      }
    }

    // ===================================================
    // SAVE
    // ===================================================

    await order.save();

    console.log(
      "✅ ORDER SAVED:",
      order._id
    );

    console.log(
      "TYPE:",
      orderType
    );

    console.log(
      "STATUS:",
      order.status
    );

    if (orderType === "rent") {
      console.log(
        "CREDENTIALS:",
        {
          login:
            order.credentials?.login || "",
          password:
            order.credentials?.password
              ? "***"
              : "",
          note:
            order.credentials?.note || "",
        }
      );
    }

    // ===================================================
    // GET UPDATED ORDER
    // ===================================================

    let updatedOrder;

    if (orderType === "rent") {
      updatedOrder =
        await RentOrder.findById(
          order._id
        )
          .populate(
            "user",
            "name email"
          )
          .populate(
            "service",
            "name description category price durationMin durationMax durationUnit"
          );
    } else {
      updatedOrder =
        await Order.findById(
          order._id
        )
          .populate(
            "user",
            "name email"
          )
          .populate(
            "service",
            "name category price"
          )
          .populate(
            "processedBy",
            "name email"
          );
    }

    // ===================================================
    // RESPONSE
    // ===================================================

    return res.status(200).json({
      success: true,
      message:
        orderType === "rent"
          ? "Rent order updated successfully"
          : "Order status updated successfully",

      data: {
        ...updatedOrder.toObject(),

        orderType,
      },
    });

  } catch (error) {
    console.error(
      "❌ UPDATE ADMIN ORDER ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update order",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAllOrders,
  updateOrderStatus,
};