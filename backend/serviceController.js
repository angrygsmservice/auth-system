const Service = require("./models/Service");

// ======================================================
// GET ALL SERVICES
// ======================================================

const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Servicelarni olishda xatolik",
    });
  }
};

// ======================================================
// CREATE SERVICE
// ======================================================

const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      status,
      price,
      durationMin,
      durationMax,
      durationUnit,
      orderFields,
      orderSettings,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service nomi kerak",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category kerak",
      });
    }

    // ------------------------------
    // CREATE
    // ------------------------------

    const service = await Service.create({
      name: name.trim(),

      description:
        description?.trim() || "",

      category:
        category.trim(),

      price:
        price ?? 0,

      durationMin:
        durationMin ?? 0,

      durationMax:
        durationMax ?? 0,

      durationUnit:
        durationUnit || "minutes",

      status:
        status || "active",

      orderFields:
        Array.isArray(orderFields)
          ? orderFields
          : [],

      orderSettings:
        orderSettings || {},
    });

    // ------------------------------
    // RESPONSE
    // ------------------------------

    res.status(201).json({
      success: true,
      message: "Service yaratildi",
      data: service,
    });

  } catch (error) {
    console.error(
      "CREATE SERVICE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Service yaratishda xatolik",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE SERVICE
// ======================================================

const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      category,
      status,
      price,
      durationMin,
      durationMax,
      durationUnit,
      orderFields,
      orderSettings,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service nomi kerak",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category kerak",
      });
    }

    // ------------------------------
    // UPDATE
    // ------------------------------

    const service =
      await Service.findByIdAndUpdate(
        id,
        {
          name:
            name.trim(),

          description:
            description?.trim() || "",

          category:
            category.trim(),

          status:
            status || "active",

          price:
            price ?? 0,

          durationMin:
            durationMin ?? 0,

          durationMax:
            durationMax ?? 0,

          durationUnit:
            durationUnit || "minutes",

          orderFields:
            Array.isArray(orderFields)
              ? orderFields
              : [],

          orderSettings:
            orderSettings || {},
        },
        {
          new: true,
          runValidators: true,
        }
      );

    // ------------------------------
    // NOT FOUND
    // ------------------------------

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service topilmadi",
      });
    }

    // ------------------------------
    // RESPONSE
    // ------------------------------

    res.status(200).json({
      success: true,
      message: "Service yangilandi",
      data: service,
    });

  } catch (error) {
    console.error(
      "UPDATE SERVICE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Service yangilashda xatolik",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE SERVICE
// ======================================================

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // ------------------------------
    // DELETE
    // ------------------------------

    const service =
      await Service.findByIdAndDelete(id);

    // ------------------------------
    // NOT FOUND
    // ------------------------------

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service topilmadi",
      });
    }

    // ------------------------------
    // RESPONSE
    // ------------------------------

    res.status(200).json({
      success: true,
      message: "Service o‘chirildi",
      data: service,
    });

  } catch (error) {
    console.error(
      "DELETE SERVICE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Service o‘chirishda xatolik",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};