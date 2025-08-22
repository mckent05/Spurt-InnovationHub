const { UnAuthenticatedError, BadRequestError } = require("../Error");
const { sendEmail } = require("../utils/email");
const User = require("../model/user");
const { StatusCodes } = require("http-status-codes");

const register = async (req, res) => {
  const {
    fullName,
    email,
    mobile,
    role,
    proofOfParticipation,
    cohort,
    associatedHub,
    password,
  } = req.body;
  // if (role !== "startup" && !associatedHub)
  //   return res
  //     .status(StatusCodes.BAD_REQUEST)
  //     .json({ message: "Hub required for startups" });
  try {
    const user = await User.create({
      fullName,
      email,
      mobile,
      role,
      cohort,
      associatedHub,
      proofOfParticipation,
      password,
    });

    // sendEmail(
    //   email,
    //   "Registration Pending",
    //   "Your registration is pending approval."
    // );
    res
      .status(StatusCodes.CREATED)
      .json({ message: "User registered, pending approval" });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new BadRequestError("Please provide username and password");
    return res.status(error.statusCode).json({ error: error.message });
  }
  const user = await User.findOne({ email });
  if (!user) {
    const error = new UnAuthenticatedError("Invalid Credentials");
    return res.status(error.statusCode).json({ error: error.message });
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    const error = new UnAuthenticatedError("Invalid Credentials");
    return res.status(error.statusCode).json({ error: error.message });
  }
  if (user.status !== "approved" && user.role !== "admin") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Account not approved yet" });
  }
  const token = await user.createJWT();
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  res.status(StatusCodes.OK).json({ token });
};

const logout = async (res, req) => {
  res.clearCookie("token");
  res.json(StatusCodes.OK);
}

module.exports = {
  login,
  register,
  logout
};
