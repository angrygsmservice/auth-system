const Payment = require("../models/Payment");

// =====================================================
// USER: CREATE DEPOSIT
// =====================================================

const createDeposit = async (req, res) => {
  try {
    const { amount } = req.body;

    // =================================================
    // AMOUNT VALIDATION
    // =================================================

    const depositAmount = Number(amount);

    if (!Number.isFinite(depositAmount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit amount",
      });
    }

    // =================================================
    // MINIMUM DEPOSIT
    // =================================================

    if (depositAmount < 5) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit is $5",
      });
    }

    // =================================================
    // CREATE PAYMENT
    // =================================================

    const payment = await Payment.create({
      user: req.user.id,
      type: "deposit",
      amount: depositAmount,
      currency: "USD",
      status: "pending",
      provider: "binance_pay",
      description: `Deposit $${depositAmount}`,
    });

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Deposit created",
      data: payment,
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