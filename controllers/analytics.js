const {
  BadRequestError,
  NotfoundError,
  InternalServerError,
  UnAuthenticatedError,
} = require("../Error");
const ExpertBooking = require("../model/expertBooking");
const HubBooking = require("../model/hubBooking");
const { StatusCodes } = require("http-status-codes");
const User = require("../model/user");

const usageMetrics = async (req, res) => {
  try {
    const hubMetrics = await HubBooking.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            user: "$userId",
          },
          bookings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          user: "$_id.user",
          bookings: 1,
        },
      },
    ]);

    // Group expert bookings
    const expertMetrics = await ExpertBooking.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            user: "$userId",
          },
          bookings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          user: "$_id.user",
          bookings: 1,
        },
      },
    ]);

    // Combine both results
    const combined = [...hubMetrics, ...expertMetrics];

    // Re-group to merge overlaps between hub + expert bookings
    const combinedMetrics = combined.reduce((acc, curr) => {
      const key = `${curr.date}-${curr.user}`;
      if (!acc[key]) {
        acc[key] = { date: curr.date, user: curr.user, bookings: 0 };
      }
      acc[key].bookings += curr.bookings;
      return acc;
    }, {});

    const result = Object.values(combinedMetrics);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

module.exports = usageMetrics;
