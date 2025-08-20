const mongoose = require("mongoose");

const ExpertBookingSchema = new mongoose.Schema({
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Startup making the booking
    required: true,
  },
  expertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expert", // Expert being booked
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  paymentEligible: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const ExpertBooking = mongoose.model("ExpertBooking", ExpertBookingSchema);

module.exports = ExpertBooking;
