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
    transactions: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
      },
    ],
    bankDetails: {
      account: String,
      ifsc: String,
    },
  },
  { timestamps: true }
);

const Wallet = new mongoose.model("Wallet", WalletSchema)

module.exports = Wallet
