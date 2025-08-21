const { NotfoundError, InternalServerError } = require("../Error");
const { StatusCodes } = require("http-status-codes");
const { Wallet, Payout } = require("../model/wallet");

const createPayOut = async (req, res) => {
  try {
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet || wallet.balance < amount)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Insufficient available balance" });
    wallet.balance -= amount;
    await wallet.save();
    const payOut = await Payout.create({
      userId: req.user.userId,
      amount,
      status: "requested",
    });
    res.status(StatusCodes.CREATED).json(payOut);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const getPayOuts = async (req, res) => {
  try {
    const {
      user: { role: role },
    } = req;
    const filter = role === "admin" ? {} : { user: req.user.userId };
    const payOuts = await Payout.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(StatusCodes.CREATED).json(payOuts);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const approvePayOut = async (req, res) => {
  const {
    params: { id: id },
  } = req;
  try {
    const payOut = await Payout.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!payOut) {
      const error = new NotfoundError(`No payout with id: ${id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(StatusCodes.OK).json(payOut);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const markPaidPayOut = async (req, res) => {
  const {
    params: { id: id },
  } = req;
  try {
    const payOut = await Payout.findByIdAndUpdate(
      id,
      { status: "paid" },
      { new: true }
    );
    if (!payOut) {
      const error = new NotfoundError(`No payout with id: ${id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(StatusCodes.OK).json(payOut);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

module.exports = {
  markPaidPayOut,
  approvePayOut,
  getPayOuts,
  createPayOut,
};
