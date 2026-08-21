const Category = require("./models/Category");

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      sortOrder: 1,
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Kategoriyalarni olishda xatolik",
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, status, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category nomi kerak",
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Bu category allaqachon mavjud",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      status: status || "active",
      sortOrder: sortOrder ?? 0,
    });

    res.status(201).json({
      success: true,
      message: "Category yaratildi",
      data: category,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Category yaratishda xatolik",
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category nomi kerak",
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        status: status || "active",
        sortOrder: sortOrder ?? 0,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category yangilandi",
      data: category,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Category yangilashda xatolik",
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category o‘chirildi",
      data: category,
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Category o‘chirishda xatolik",
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};