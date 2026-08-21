const Order = require("../models/Order");
const Service = require("../models/Service");
const User = require("../models/User");

const SERVICE_FIELDS =
  "name description category price duration durationMin durationMax durationUnit status orderFields lockPictures";

const createOrder = async (req, res) => {
  try {
    const {
      serviceId,
      formData = {},
      lockPictures = [],
    } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Service is not active",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const servicePrice = Number(service.price);

    if (
      !Number.isFinite(servicePrice) ||
      servicePrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid service price",
      });
    }

    if (user.balance < servicePrice) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        balance: user.balance,
        required: servicePrice,
      });
    }

    // =========================
    // VALIDATE ORDER FIELDS
    // =========================

    for (const field of service.orderFields || []) {
      const value = formData[field.name];

      if (
        field.required &&
        (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `${field.label} is required`,
        });
      }

      // SELECT FIELD VALIDATION
      if (
        field.type === "select" &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        if (
          !field.options ||
          !field.options.includes(String(value))
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field.label}`,
          });
        }
      }
    }

    // =========================
    // LOCK PICTURES
    // =========================
    //
    // Lock pictures service'dan olinadi.
    // User yuborgan lockPictures'ga ishonmaymiz.
    //
    // Admin DevicesPage orqali service'ga
    // qo'shgan rasmlar ishlatiladi.
    //
    const serviceLockPictures =
      Array.isArray(service.lockPictures)
        ? service.lockPictures
        : [];

    console.log(
      "========== CREATING ORDER =========="
    );

    console.log(
      "USER ID:",
      req.user.id
    );

    console.log(
      "SERVICE ID:",
      service._id
    );

    console.log(
      "SERVICE NAME:",
      service.name
    );

    console.log(
      "SERVICE CATEGORY:",
      service.category
    );

    console.log(
      "SERVICE PRICE:",
      service.price
    );

    console.log(
      "SERVICE LOCK PICTURES:",
      serviceLockPictures
    );

    console.log(
      "FORM DATA:",
      formData
    );

    // =========================
    // CREATE ORDER
    // =========================

    user.balance -= servicePrice;

    await user.save();

    const order = await Order.create({
      user: req.user.id,

      service: service._id,

      formData,

      lockPictures: serviceLockPictures,

      price: service.price,
    });

    // =========================
    // POPULATE ORDER
    // =========================

    const populatedOrder =
      await Order.findById(order._id).populate(
        "service",
        SERVICE_FIELDS
      );

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      data: populatedOrder,
    });

  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create order",

      error: error.message,
    });
  }
};


// =========================
// GET USER ORDERS
// =========================

const getOrders = async (req, res) => {
  try {
    console.log(
      "========== GET ORDERS =========="
    );

    console.log(
      "USER:",
      req.user
    );

    console.log(
      "USER ID:",
      req.user.id
    );

    const orders =
      await Order.find({
        user: req.user.id,
      })
        .populate(
          "service",
          SERVICE_FIELDS
        )
        .sort({
          createdAt: -1,
        });

    console.log(
      "ORDERS FOUND:",
      orders.length
    );

    console.log(
      "ORDERS:",
      JSON.stringify(
        orders,
        null,
        2
      )
    );

    return res.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to get orders",

      error: error.message,
    });
  }
};


// =========================
// GET SERVER ORDERS
// =========================

const getServerOrders = async (
  req,
  res
) => {
  try {
    console.log(
      "GET SERVER ORDERS USER:",
      req.user.id
    );

    const orders =
      await Order.find({
        user: req.user.id,
      })
        .populate(
          "service",
          SERVICE_FIELDS
        )
        .sort({
          createdAt: -1,
        });

    const serverOrders =
      orders.filter(
        (order) =>
          order.service &&
          order.service.category ===
            "SERVER SERVICE"
      );

    console.log(
      "GET SERVER ORDERS COUNT:",
      serverOrders.length
    );

    return res.json({
      success: true,
      data: serverOrders,
    });

  } catch (error) {
    console.error(
      "GET SERVER ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to get server orders",

      error: error.message,
    });
  }
};


module.exports = {
  createOrder,
  getOrders,
  getServerOrders,
};