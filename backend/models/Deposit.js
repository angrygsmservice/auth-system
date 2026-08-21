const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 5,
    },

    currency: {
      type: String,
      default: "USDT",
      uppercase: true,
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

    binancePaymentId: {
      type: String,
      default: "",
      unique: true,
      sparse: true,
    },

    transactionId: {
      type: String,
      default: "",
    },

    network: {
      type: String,
      default: "",
    },

    walletAddress: {
      type: String,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Deposit",
  depositSchema
);