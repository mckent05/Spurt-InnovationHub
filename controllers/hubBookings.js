const {
  BadRequestError,
  NotfoundError,
  InternalServerError,
  UnAuthenticatedError,
} = require("../Error");
const HubBooking = require("../model/hubBooking");
const { StatusCodes } = require("http-status-codes");

const createHubBooking = async (req, res) => {
  try {
    const { hubId, startDate, endDate, slots } = req.body;
    const booking = await HubBooking.create({
      hub: hubId,
      startupId: req.user.userId,
      startDate,
      endDate,
      slots,
    });
    res.status(StatusCodes.CREATED).json(booking);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const getHubBookings = async (req, res) => {
  try {
    let q = {};
    if (req.user.role === "startup_representative")
      q.startupUser = req.user.sub;
    const hubBookings = await HubBooking.find(q)
      .populate("hub")
      .sort({ createdAt: -1 })
      .limit(200);
    res.Status(StatusCodes.CREATED).json(hubBookings);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const approveHubBooking = async (req, res) => {
  try {
    const hubBooking = await HubBooking.findByIdAndUpdate(
      req.params.id,
      { status: "approved_by_manager" },
      { new: true }
    );
    if (!hubBooking) {
      const error = new NotfoundError(`No Hub with id: ${req.params.id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.json(hubBooking);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const confirmHubBooking = async (req, res) => {
  try {
    const hubBooking = await HubBooking.findById(req.params.id);
    if (!hubBooking) {
      const error = new NotfoundError(`No Hub with id: ${req.params.id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (booking.startupId.toString() !== req.user.userId)
      return res.status(403).json({ error: "Forbidden" });
    if (booking.status === "approved_by_manager") {
      booking.status = "confirmed";
      await booking.save();
    }
    res.json(hubBooking);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

module.exports = {
  confirmHubBooking,
  approveHubBooking,
  getHubBookings,
  createHubBooking,
};