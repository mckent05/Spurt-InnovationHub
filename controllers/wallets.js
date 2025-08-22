const { NotfoundError, InternalServerError } = require("../Error");
const { StatusCodes } = require("http-status-codes");
const { Wallet, PayoutMethod, WalletTx } = require("../model/wallet");

const getWalletTxs = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.userId });
    if (!wallet)
      wallet = await Wallet.create({
        user: req.user.userId,
        balance: 0,
        pending: 0,
      });
    const transactions = await WalletTx.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(StatusCodes.OK).json({
      balance: { balance: wallet.balance, pending: wallet.pending },
      transactions: transactions,
    });
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const createPayOutMethod = async (req, res) => {
  try {
    const payOutMethod = await PayoutMethod.create(
      { user: req.user.userId },
      req.body,
      { upsert: true, new: true }
    );
    res.status(StatusCodes.CREATED).json(payOutMethod);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const getPayOutMethods = async (req, res) => {
  try {
    const payOutMethod = await PayoutMethod.find({ userId: req.user.userId });
    res.status(StatusCodes.OK).json(payOutMethod || {});
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

module.exports = { createPayOutMethod, getPayOutMethods, getWalletTxs };
