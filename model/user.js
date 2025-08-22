const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Wallet } = require("../model/wallet")

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["startup", "hub_manager", "expert", "admin"],
      required: true,
    },
    cohort: {
      type: String,
      enum: ["cohort 1", "cohort 2", "cohort 3", "cohort 4"],
      required: true,
    },
    associatedHub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub", // Reference to Hubs collection
    },
    proofOfParticipation: {
      type: String, // File URL
    },
    expertProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert", // Link to Expert model
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    password: {
      type: String,
      required: true,
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.virtual("bookings", {
  ref: "ExpertBooking",
  localField: "_id",
  foreignField: "startupId",
});

UserSchema.virtual("hubBookings", {
  ref: "HubBooking",
  localField: "_id",
  foreignField: "startupId",
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = async function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.fullName,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

UserSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

UserSchema.post("save", async function (doc, next) {
  try {
    const existingWallet = await Wallet.findOne({ userId: doc._id });
    if (!existingWallet) {
      await Wallet.create({ userId: doc._id });
    }
    next();
  } catch (err) {
    next(err);
  }
});

const User = new mongoose.model("User", UserSchema);

module.exports = User;
