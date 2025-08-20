const mongoose = require("mongoose");

const mongoose = require("mongoose");

const HubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    locationLat: {
      type: Number,
    },
    locationLng: {
      type: Number,
    },
    address: {
      type: String,
    },
    photo: {
      type: String,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User (hub manager)
      unique: true,
    },
    availability: {
      type: [
        {
          date: { type: String },
          slots: [String],
        },
      ],
      default: [],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

HubSchema.virtual("bookings", {
  ref: "HubBooking",
  localField: "_id",
  foreignField: "hubId",
});

HubSchema.pre("save", async function (next) {
  if (this.managerId) {
    const User = mongoose.model("User");
    const manager = await User.findById(this.managerId);

    if (!manager) {
      return next(new Error("Manager user not found"));
    }

    if (manager.role !== "hub_manager") {
      return next(new Error("Assigned user must have role = hub_manager"));
    }
  }
  next();
});

const Hub = mongoose.model("Hub", HubSchema);

module.exports = Hub;
