const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["deposit", "order_payment", "refund"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },

    provider: {
      type: String,
      enum: ["binance_pay", "balance"],
      required: true,
    },

    providerOrderId: {
      type: String,
      default: "",
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    rentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentOrder",
      default: null,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);