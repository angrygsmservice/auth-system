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
    // SHOW RENT ORDERS
    // ===================================================

    console.log(
      "6️⃣ RENT ORDERS DATA:"
    );

    console.log(
      rentOrders.map((order) => ({
        id: order._id,
        user: order.user?.email,
        service: order.service?.name,
        status: order.status,
        price: order.price,
        duration: order.duration,
        durationUnit: order.durationUnit,
        startTime: order.startTime,
        endTime: order.endTime,
        createdAt: order.createdAt,
      }))
    );

    // ===================================================
    // CONVERT RENT ORDERS TO ADMIN ORDER FORMAT
    // ===================================================

    const formattedRentOrders = rentOrders.map((order) => ({
      ...order.toObject(),

      // Frontend rent order ekanini bilishi uchun
      orderType: "rent",

      // Service
      service: order.service,

      // Rent information
      duration: order.duration,
      durationUnit: order.durationUnit,
      startTime: order.startTime,
      endTime: order.endTime,

      // Status
      status: order.status,

      // User
      user: order.user,
    }));

    console.log(
      "7️⃣ FORMATTED RENT ORDERS:",
      formattedRentOrders.length
    );

    // ===================================================
    // MARK NORMAL ORDERS
    // ===================================================

    const formattedNormalOrders = normalOrders.map(
      (order) => ({
        ...order.toObject(),

        orderType: "normal",
      })
    );

    console.log(
      "8️⃣ FORMATTED NORMAL ORDERS:",
      formattedNormalOrders.length
    );

    // ===================================================
    // COMBINE BOTH
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
    // FINAL DEBUG
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

    console.log("====================================");
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

    return res.json({
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
// ADMIN: UPDATE NORMAL ORDER STATUS
// =====================================================
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminReply } = req.body;

    const allowedStatus = [
      "pending",
      "processing",
      "completed",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // =====================================================
    // 1. AVVAL NORMAL ORDERNI QIDIRAMIZ
    // =====================================================

    let order = await Order.findById(req.params.id);

    let orderType = "normal";

    // =====================================================
    // 2. NORMAL ORDER TOPILMASA RENT ORDERNI QIDIRAMIZ
    // =====================================================

    if (!order) {
      order = await RentOrder.findById(req.params.id);
      orderType = "rent";
    }

    // =====================================================
    // 3. UMUMAN TOPILMASA
    // =====================================================

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order topilmadi",
      });
    }

    // =====================================================
    // 4. STATUSNI UPDATE
    // =====================================================

    order.status = status;

    order.adminReply = adminReply || "";

    order.repliedAt = new Date();

    order.repliedBy = req.user.id;

    if (status === "cancelled") {
      order.cancelReason = "Cancelled by admin";
    }

    await order.save();

    // =====================================================
    // 5. UPDATED ORDERNI QAYTA OLISH
    // =====================================================

    let updatedOrder;

    if (orderType === "rent") {
      updatedOrder = await RentOrder.findById(order._id)
        .populate("user", "name email")
        .populate(
          "service",
          "name description category price durationMin durationMax durationUnit"
        );
    } else {
      updatedOrder = await Order.findById(order._id)
        .populate("user", "name email")
        .populate("service", "name category price")
        .populate("processedBy", "name email");
    }

    // =====================================================
    // 6. RESPONSE
    // =====================================================

    return res.json({
      success: true,
      message: "Order status updated",
      data: {
        ...updatedOrder.toObject(),
        orderType,
      },
    });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
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