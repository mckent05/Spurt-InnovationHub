const {
  BadRequestError,
  NotfoundError,
  InternalServerError,
  UnAuthenticatedError,
} = require("../Error");
const Expert = require("../model/expert");
const { StatusCodes } = require("http-status-codes");
const User = require("../model/user");

const getExperts = async (req, res) => {
  try {
    // const { expertise, search } = req.query;
    // const filter = {};
    // if (expertise) filter.expertise = { $in: [expertise] };
    // const pipeline = [
    //   { $match: filter },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "user",
    //       foreignField: "_id",
    //       as: "user",
    //     },
    //   },
    //   // { $unwind: "$user" },
    // ];
    // if (search) {
    //   pipeline.push({
    //     $match: {
    //       $or: [
    //         { "user.fullName": { $regex: search, $options: "i" } },
    //         { bio: { $regex: search, $options: "i" } },
    //       ],
    //     },
    //   });
    // }
    const experts = await Expert.find().populate({
      path: "userId",
      select: "fullName email role"
    });
    res.status(StatusCodes.OK).json(experts);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const createExpert = async (req, res) => {
  const { biography, expertise, calendarLink } = req.body;
  try {
    const userId = req.user.userId;
    
    const existing = await Expert.findOne({ userId });
    if (existing) return res.json(existing);
    const expert = await Expert.create({
      userId: userId,
      biography,
      calendarLink,
      expertise,
    });
    res.status(StatusCodes.CREATED).json(expert);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

const updateExpert = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { biography, calendarLink, expertise } = req.body;
    const expert = await Expert.findOneAndUpdate(
      { userId: userId },
      { biography, calendarLink, expertise },
      { upsert: true, new: true }
    ).populate("userId");
    if (!expert) {
      const error = new NotfoundError(`No expert with id: ${userId} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(StatusCodes.OK).json(expert);
  } catch (err) {
    console.error(err);
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

module.exports = {
  getExperts,
  createExpert,
  updateExpert,
};
