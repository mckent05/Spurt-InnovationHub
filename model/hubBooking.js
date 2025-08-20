const mongoose = require("mongoose");

const HubBookingSchema = new mongoose.Schema({
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Startup making the booking
    required: true,
  },
  hubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hub", // Hub being booked
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  slot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "hub_approved", "startup_confirmed", "completed"],
    default: "pending",
  },
}, { timestamps: true });

const HubBooking = mongoose.model("HubBooking", HubBookingSchema);

module.exports = HubBooking;
