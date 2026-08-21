const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "deposit",
        "withdraw",
        "order_payment",
        "refund",
    ],
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
      enum: [
        "pending",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: [
        "binance_pay",
        "balance",
      ],
      required: true,
    },

    referenceId: {
      type: String,
      default: "",
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
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

module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);