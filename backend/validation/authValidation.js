const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Ism kiritilishi shart"),

  body("email")
    .isEmail()
    .withMessage("Email noto'g'ri"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Parol kamida 8 ta belgidan iborat bo'lishi kerak"),
];


const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Email noto'g'ri"),

  body("password")
    .notEmpty()
    .withMessage("Parol kiritilishi shart"),
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("Email noto'g'ri"),
];

const verifyOtpValidation = [
  body("email")
    .isEmail()
    .withMessage("Email noto'g'ri"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP 6 xonali bo'lishi kerak"),
];

const resetPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("Email noto'g'ri"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP 6 xonali bo'lishi kerak"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak"),
];

const changePasswordValidation = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Eski parol kiritilishi shart"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak"),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
  changePasswordValidation,
};