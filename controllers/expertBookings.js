const {
  BadRequestError,
  NotfoundError,
  InternalServerError,
  UnAuthenticatedError,
} = require("../Error");
const ExpertBooking = require("../model/expertBooking");
const Expert = require("../model/expert");
const { StatusCodes } = require("http-status-codes");
const { Wallet, WalletTx } = require("../model/wallet");
const User = require("../model/user");

const createBooking = async (req, res) => {
  try {
    const { expertId, startDate, endDate } = req.body;
    const booking = await ExpertBooking.create({
      expertId: expertId,
      startupId: req.user.userId,
      startDate,
      endDate,
      status: "requested",
    });
    res.status(StatusCodes.CREATED).json(booking);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const {
      user: { role },
    } = req;
    let q = {};
    if (role === "startup") {
      q.startupId = req.user.userId;
    } else if (role === "expert") {
      const expert = await Expert.findOne({ userId: req.user.userId });
      if (expert) q.expertId = expert._id;
      else q._id = null;
    }
    const bookings = await ExpertBooking.find(q)
      .populate({ path: "expertId", populate: { path: "userId" } })
      .populate("startupId")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(StatusCodes.CREATED).json(bookings);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const approveBooking = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const booking = await ExpertBooking.findById(id).populate("expertId");
    if (!booking) {
      const error = new NotfoundError(`No booking with ${id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    const expert = await Expert.findById(booking.expertId._id);
    if (expert.userId.toString() !== req.user.userId)
      return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
    booking.status = "approved";
    await booking.save();
    res.status(StatusCodes.OK).json(booking);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const confirmBooking = async (req, res) => {
  const {
    params: { id: id },
  } = req;
  try {
    const booking = await ExpertBooking.findById(id).populate("expertId");
    if (!booking) {
      const error = new NotfoundError(`No Booking with id: ${id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (booking.startupId.toString() !== req.user.userId)
      return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
    booking.status = "confirmed";
    await booking.save();
    if (booking.agreedRate > 0) {
      // place funds on hold (pending) for expert
      let wallet = await Wallet.findOne({ user: booking.expertId.userId });
      if (!wallet)
        wallet = await Wallet.create({
          userId: booking.expertId.userId,
          available: 0,
          pending: 0,
        });
      wallet.pending += s.agreedRate;
      await wallet.save();
      await WalletTx.create({
        walletId: wallet._id,
        txType: "session_hold",
        amount: booking.agreedRate,
        ref: booking._id.toString(),
      });
    }
    res.json(booking);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const completeBooking = async (req, res) => {
  const {
    params: { id: id },
  } = req;
  try {
    const booking = await ExpertBooking.findById(id).populate("expertId");
    if (!booking) {
      const error = new NotfoundError(`No Booking with id: ${id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    const marker =
      req.user.role === "expert"
        ? "expert"
        : req.user.role === "startup_representative"
        ? "startup"
        : "admin";
    if (marker !== "admin") {
      if (marker === "expert") {
        if (booking.expertId.userId.toString() !== req.user.userId) {
          return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        }
      } else {
        if (booking.startupId.toString() !== req.user.userId)
          return res.status(403).json({ error: "Forbidden" });
      }
    }
    if (!booking.completedMarkers.includes(marker))
      booking.completedMarkers.push(marker);
    if (new Set(booking.completedMarkers).size >= 2 || marker === "admin") {
      booking.status = "completed";
      // release pending -> available
      if (booking.agreedRate > 0) {
        let wallet = await Wallet.findOne({ userId: booking.expertId.userId });
        if (!wallet)
          wallet = await Wallet.create({
            userId: booking.expertId.userId,
            balance: 0,
            pending: 0,
          });
        if (wallet.pending >= booking.agreedRate)
          wallet.pending -= booking.agreedRate;
        wallet.balance += booking.agreedRate;
        await wallet.save();
        await WalletTx.create({
          walletId: wallet._id,
          txType: "release_to_available",
          amount: booking.agreedRate,
          ref: booking._id.toString(),
        });
      }
    }
    await booking.save();
    res.json({
      status: booking.status,
      paymentEligible: booking.status === "completed",
    });
    res.json(booking);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

module.exports = {
  completeBooking,
  getBookings,
  createBooking,
  confirmBooking,
  approveBooking,
};
