const mongoose = require("mongoose");

const ExpertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to Users collection
      unique: true,
      required: true,
    },
    biography: {
      type: String,
    },
    expertise: {
      type: [String],
    },
    calendarLink: {
      type: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ExpertSchema.virtual("bookings", {
  ref: "ExpertBooking",
  localField: "_id",
  foreignField: "expertId",
});

const Expert = mongoose.model("Expert", ExpertSchema);

module.exports = Expert;
