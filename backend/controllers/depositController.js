const Deposit = require("../models/Deposit");

const createDeposit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    // Amount tekshirish
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const depositAmount = Number(amount);

    // Noto'g'ri summa
    if (
      !Number.isFinite(depositAmount) ||
      depositAmount < 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is $5",
      });
    }

    // Deposit yaratish
    const deposit = await Deposit.create({
      user: userId,
      amount: depositAmount,
      currency: "USDT",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Deposit created",
      data: deposit,
    });
  } catch (error) {
    console.error(
      "CREATE DEPOSIT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create deposit",
    });
  }
};

module.exports = {
  createDeposit,
};