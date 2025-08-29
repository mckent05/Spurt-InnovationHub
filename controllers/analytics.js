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
    // Group hub bookings by date
    const hubMetrics = await HubBooking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          userIds: { $addToSet: "$startupId" }, // Collect unique user IDs
          bookings: { $sum: 1 }, // Count total bookings
        },
      },
      {
        $lookup: {
          from: "users", // Ensure this matches your User collection name
          localField: "userIds",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          userCount: { $size: "$userIds" }, // Count unique users
          bookings: 1,
          users: {
            $map: {
              input: "$userData",
              as: "user",
              in: {
                _id: "$$user._id",
                fullName: { $ifNull: ["$$user.fullName", "Unknown"] },
                email: { $ifNull: ["$$user.email", "Unknown"] },
              },
            },
          },
        },
      },
    ]);

    // Group expert bookings by date
    const expertMetrics = await ExpertBooking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          userIds: { $addToSet: "$startupId" }, // Collect unique user IDs
          bookings: { $sum: 1 }, // Count total bookings
        },
      },
      {
        $lookup: {
          from: "users", // Ensure this matches your User collection name
          localField: "userIds",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          userCount: { $size: "$userIds" }, // Count unique users
          bookings: 1,
          users: {
            $map: {
              input: "$userData",
              as: "user",
              in: {
                _id: "$$user._id",
                fullName: { $ifNull: ["$$user.fullName", "Unknown"] },
                email: { $ifNull: ["$$user.email", "Unknown"] },
              },
            },
          },
        },
      },
    ]);

    // Combine and merge results by date
    const combinedMetrics = [...hubMetrics, ...expertMetrics].reduce(
      (acc, curr) => {
        const key = curr.date;
        if (!acc[key]) {
          acc[key] = {
            date: curr.date,
            userCount: 0,
            bookings: 0,
            users: [],
          };
        }
        acc[key].userCount += curr.userCount; // Sum unique users (may need adjustment, see notes)
        acc[key].bookings += curr.bookings;
        acc[key].users = [...acc[key].users, ...curr.users]; // Merge user details
        return acc;
      },
      {}
    );

    // Convert to array and remove duplicate users
    const result = Object.values(combinedMetrics).map((metric) => {
      // Deduplicate users by _id
      const uniqueUsers = Array.from(
        new Map(
          metric.users.map((user) => [user._id.toString(), user])
        ).values()
      );
      return {
        date: metric.date,
        userCount: uniqueUsers.length, // Use length of unique users
        bookings: metric.bookings,
      };
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.error("Error in usageMetrics:", error.message, error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

const popularExperts = (req, res) => {

}

module.exports = usageMetrics;
