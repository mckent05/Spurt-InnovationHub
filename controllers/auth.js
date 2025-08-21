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
    throw new BadRequestError("Please provide username and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new UnAuthenticatedError("Invalid Credentials");
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

module.exports = {
  login,
  register,
};
