const Service = require("../models/Service");

// GET ALL SERVICES
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);
    next(error);
  }
};

// CREATE SERVICE
const createService = async (req, res, next) => {
  try {
    console.log("========== CREATE SERVICE ==========");
    console.log("BODY:", req.body);

    const {
      name,
      description,
      category,
      price,
      durationMin,
      durationMax,
      durationUnit,
      status,
      orderFields,
      lockPictures,
      orderSettings,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name va category kiritilishi shart",
      });
    }

    const service = await Service.create({
      name,
      description,
      category,
      price,
      durationMin,
      durationMax,
      durationUnit,
      status,
      orderFields,
      lockPictures,
      orderSettings,
    });

    console.log("SERVICE CREATED:", service);

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    next(error);
  }
};

// UPDATE SERVICE
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("UPDATE SERVICE ERROR:", error);
    next(error);
  }
};

// DELETE SERVICE
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SERVICE ERROR:", error);
    next(error);
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};