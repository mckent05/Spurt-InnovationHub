const mongoose = require("mongoose");


const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User collection
      required: true,
      unique: true, // ensures one wallet per user
    },
    balance: {
      type: Number,
      default: 0,
    },
    pending: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", WalletSchema)

const WalletTxSchema = new mongoose.Schema({
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  txType: { type: String, enum: ['session_hold','release_to_available','payout'] },
  amount: { type: Number, required: true },
  ref: String,
  status: { type: String, enum: ['posted','reversed'], default: 'posted' },
  createdAt: { type: Date, default: Date.now }
});

const WalletTx = mongoose.model('WalletTx', WalletTxSchema);

const PayoutMethodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bankName: String,
  accountNumber: String,
  accountName: String
});

const PayoutMethod = mongoose.model('PayoutMethod', PayoutMethodSchema);

const PayoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['requested','approved','processing','paid','failed'], default: 'requested' },
  createdAt: { type: Date, default: Date.now }
});

const Payout = mongoose.model('Payout', PayoutSchema);

module.exports = { Wallet, PayoutMethod, Payout, WalletTx }
