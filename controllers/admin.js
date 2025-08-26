const {
  UnAuthenticatedError,
  BadRequestError,
  NotfoundError,
} = require("../Error");
const { sendEmail } = require("../utils/email");
const User = require("../model/user");
const { StatusCodes } = require("http-status-codes");

const users = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status: status } : {};
    const users = await User.find(query)
      .select("email fullName role phone status createdAt")
      .limit(200)
      .sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json(users);
  } catch (e) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    ).select("email fullName role phone status");
    if (!user) {
      const error = new NotfoundError(`User with ${id} not found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    // await sendEmail({
    //   to: user.email,
    //   subject: "Account Approved",
    //   html: "<p>Your account has been approved.</p>",
    // });
    res.status(StatusCodes.OK).json(user);
  } catch (e) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

const rejectUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    ).select("email fullName role phone status");
    if (!user) {
      const error = new NotfoundError(`User with ${id} not found`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    // await sendEmail({
    //   to: user.email,
    //   subject: "Account Rejected",
    //   html: "<p>Your account has been rejected.</p>",
    // });
    res.json(user);
  } catch (e) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

module.exports = {
  users,
  approveUser,
  rejectUser,
};
