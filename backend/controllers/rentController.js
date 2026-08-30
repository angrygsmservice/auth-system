const RentOrder = require("../models/rentOrder");
const Service = require("../models/Service");

// =====================================================
// USER: CREATE RENT ORDER
// =====================================================

const createRentOrder = async (req, res) => {
  try {
    console.log("RENT REQUEST:", req.body);

    const { serviceId } = req.body;

    // =================================================
    // SERVICE ID VALIDATION
    // =================================================

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    // =================================================
    // FIND SERVICE
    // =================================================

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // =================================================
    // SERVICE STATUS
    // =================================================

    if (service.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Service is inactive",
      });
    }

    // =================================================
    // DEBUG
    // =================================================

    console.log("====================================");
    console.log("RENT SERVICE DATA");
    console.log("====================================");
    console.log("ID:", service._id);
    console.log("NAME:", service.name);
    console.log("PRICE:", service.price);
    console.log("DURATION MIN:", service.durationMin);
    console.log("DURATION MAX:", service.durationMax);
    console.log("DURATION UNIT:", service.durationUnit);
    console.log("====================================");

    // =================================================
    // PRICE VALIDATION
    // =================================================

    if (
      service.price === undefined ||
      service.price === null ||
      Number(service.price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Service price is not configured",
        serviceId: service._id,
        price: service.price,
      });
    }

    // =================================================
// DURATION VALIDATION
// =================================================

const durationMin = Number(service.durationMin);
const durationMax = Number(service.durationMax);

if (!Number.isFinite(durationMin) || durationMin <= 0) {
  return res.status(400).json({
    success: false,
    message: "Service duration is not configured",
    serviceId: service._id,
    durationMin: service.durationMin,
    durationMax: service.durationMax,
  });
}

const duration =
  durationMax > 0
    ? durationMax
    : durationMin;

// =================================================
// START TIME
// =================================================

const startTime = new Date();

// =================================================
// CREATE RENT ORDER
// =================================================

const rentOrder = await RentOrder.create({
  user: req.user.id,
  service: service._id,
  price: Number(service.price),

  duration,

  durationUnit: service.durationUnit,

  // User order bergan aniq vaqt
  startTime,

  // Hali rent boshlanmagan
  activatedAt: null,

  // Hali tugamagan
  endTime: null,

  // Hali bekor qilinmagan
  cancelledAt: null,

  status: "pending",
});

    // =================================================
    // SUCCESS
    // =================================================

    console.log(
      "===================================="
    );

    console.log(
      "RENT ORDER CREATED:",
      rentOrder._id
    );

    console.log(
      "===================================="
    );

    return res.status(201).json({
      success: true,
      message: "Rent order created successfully",
      data: rentOrder,
    });

  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "CREATE RENT ORDER ERROR:"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create rent order",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// USER: GET MY RENT ORDERS
// =====================================================

const getMyRentOrders = async (req, res) => {
  try {
    const rentOrders = await RentOrder.find({
      user: req.user.id,
    })
      .populate(
        "service",
        "name description price durationMin durationMax durationUnit"
      )
      .sort({
        createdAt: -1,
      });

    console.log("MY RENT ORDERS:", rentOrders);

    return res.status(200).json({
      success: true,
      data: rentOrders,
    });
  } catch (error) {
    console.error(
      "GET MY RENT ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get your rent orders",
    });
  }
};

// =====================================================
// ADMIN: GET ALL RENT ORDERS
// =====================================================

const getRentOrders = async (req, res) => {
  try {
    const rentOrders = await RentOrder.find()
      .populate(
        "user",
        "name email"
      )
      .populate(
        "service",
        "name description price duration durationUnit"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: rentOrders,
    });
  } catch (error) {
    console.error(
      "GET RENT ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get rent orders",
    });
  }
};

// =====================================================
// ADMIN: UPDATE STATUS
// =====================================================

const updateRentOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "active",
      "completed",
      "cancelled",
    ];

    // =================================================
    // STATUS VALIDATION
    // =================================================

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rent order status",
      });
    }

    // =================================================
    // FIND ORDER
    // =================================================

    const rentOrder = await RentOrder.findById(id);

    if (!rentOrder) {
      return res.status(404).json({
        success: false,
        message: "Rent order not found",
      });
    }

    // =================================================
    // UPDATE DATA
    // =================================================

    const updateData = {
      status,
    };

    // =================================================
    // ACTIVE
    // =================================================

    if (status === "active") {
      updateData.activatedAt = new Date();
    }

    // =================================================
    // COMPLETED
    // =================================================

    if (status === "completed") {
      updateData.endTime = new Date();
    }

    // =================================================
    // CANCELLED
    // =================================================

    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    // =================================================
    // UPDATE
    // =================================================

    const updatedOrder = await RentOrder.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user", "name email")
      .populate(
        "service",
        "name description price durationMin durationMax durationUnit"
      );

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Rent order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "UPDATE RENT ORDER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update rent order status",
    });
  }
};

// =====================================================
// ADMIN: SAVE CREDENTIALS
// =====================================================

const updateRentOrderCredentials = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      login,
      password,
      note,
      status,
    } = req.body;

    // =================================================
    // LOGIN VALIDATION
    // =================================================

    if (
      !login ||
      !login.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Login is required",
      });
    }

    // =================================================
    // PASSWORD VALIDATION
    // =================================================

    if (
      !password ||
      !password.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // =================================================
    // STATUS VALIDATION
    // =================================================

    const allowedStatuses = [
      "pending",
      "active",
      "completed",
      "cancelled",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid rent order status",
      });
    }

    // =================================================
    // UPDATE DATA
    // =================================================

    const updateData = {
      credentials: {
        login: login.trim(),

        password: password.trim(),

        note:
          note && typeof note === "string"
            ? note.trim()
            : "",
      },
    };

    // =================================================
    // UPDATE STATUS IF PROVIDED
    // =================================================

    if (status) {
      updateData.status = status;
    }

    // =================================================
    // UPDATE ORDER
    // =================================================

    const rentOrder =
      await RentOrder.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "service",
          "name description price duration durationUnit"
        );

    // =================================================
    // NOT FOUND
    // =================================================

    if (!rentOrder) {
      return res.status(404).json({
        success: false,
        message: "Rent order not found",
      });
    }

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Rent credentials updated successfully",
      data: rentOrder,
    });
  } catch (error) {
    console.error(
      "UPDATE RENT CREDENTIALS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update rent credentials",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createRentOrder,
  getMyRentOrders,
  getRentOrders,
  updateRentOrderStatus,
  updateRentOrderCredentials,
};
