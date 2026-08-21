const mongoose = require("mongoose");

const orderFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "number", "textarea", "select", "image"],
      default: "text",
    },

    required: {
      type: Boolean,
      default: false,
    },

    placeholder: {
      type: String,
      default: "",
      trim: true,
    },

    options: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);


const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    durationMin: {
      type: Number,
      default: 0,
      min: 0,
    },

    durationMax: {
      type: Number,
      default: 0,
      min: 0,
    },

    durationUnit: {
      type: String,
      enum: ["minutes", "hours", "days"],
      default: "minutes",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },


    // Custom fields
    orderFields: {
      type: [orderFieldSchema],
      default: [],
    },

    // Lock Pictures
    lockPictures: {
      type: [String],
      default: [],
    },


    // Global order options
    orderSettings: {
      imei: {
        type: Boolean,
        default: false,
      },

      image: {
        type: Boolean,
        default: false,
      },

      notes: {
        type: Boolean,
        default: false,
      },
    },
  },

  {
    timestamps: true,
  }
);


module.exports =
  mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);