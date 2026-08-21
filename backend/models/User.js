const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },


    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },


    password: {
      type: String,
      required: true,
      select: false,
    },


    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },


    avatar: {
      type: String,
      default: "",
    },


    isDeleted: {
      type: Boolean,
      default: false,
    },


    isVerified: {
      type: Boolean,
      default: false,
    },


    verificationToken: {
      type: String,
      default: "",
    },


    verificationExpire: {
      type: Date,
      default: null,
    },


    refreshToken: {
      type: String,
      default: "",
      select: false,
    },


    resetOTP: {
      type: String,
      default: "",
    },


    resetOTPExpire: {
      type: Date,
      default: null,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      default: "",
    },

  },
  {
    timestamps: true,
  }
);


// Soft delete filter
userSchema.pre(/^find/, function () {
  if (this.getOptions().includeDeleted) {
    return;
  }

  this.where({
    isDeleted: false,
  });
});


module.exports = mongoose.model("User", userSchema);