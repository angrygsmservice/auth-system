const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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

    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    lockPictures: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    result: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    adminReply: {
      type: String,
      default: "",
    },

    repliedAt: {
      type: Date,
      default: null,
    },

    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);