const {
  NotfoundError,
  UnAuthenticatedError,
  InternalServerError,
} = require("../Error");
const { StatusCodes } = require("http-status-codes");
const User = require("../model/user");

const getUser = async (req, res) => {
  const {
    user: { userId: id },
  } = req;

  try {
    const user = await User.findById(id).select(
      "email mobile role fullName"
    );

     if (!user) {
      const error = new NotfoundError(`No user with id: ${id} found`);
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(StatusCodes.OK).json(user);
  } catch (err) {
    console.error(err);
    if (err instanceof NotfoundError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    const error = new InternalServerError("Server error");
    res.status(error.statusCode).json({ error: error.message });
  }
};

module.exports = getUser;
