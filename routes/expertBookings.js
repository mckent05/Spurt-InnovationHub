const express = require("express");
const {
  completeBooking,
  getBookings,
  confirmBooking,
  createBooking,
  approveBooking,
} = require("../controllers/expertBookings");
const { roleCheck } = require("../middleWare/authenticationHandler");

const routes = express.Router();

routes
  .route("/")
  .get(getBookings)
  .post(roleCheck(["startup"]), createBooking);

routes.route("/:id/approve").patch(roleCheck(["expert"]), approveBooking);
routes.route("/:id/confirm").patch(roleCheck(["startup"]), confirmBooking);
routes.route("/:id/complete").patch(completeBooking);

module.exports = routes;
