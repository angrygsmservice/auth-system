const mongoose = require("mongoose");

const rentOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: Number,
      required: true,
      min: 0,
    },

    durationUnit: {
      type: String,
      enum: ["minutes", "hours", "days"],
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    adminReply: {
      type: String,
      default: "",
    },

    credentials: {
      login: {
        type: String,
        default: "",
      },

      password: {
        type: String,
        default: "",
      },

      note: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.RentOrder ||
  mongoose.model("RentOrder", rentOrderSchema);