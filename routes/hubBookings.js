const express = require("express");
const {
  confirmHubBooking,
  approveHubBooking,
  getHubBookings,
  createHubBooking,
} = require("../controllers/hubBookings");
const { roleCheck } = require("../middleWare/authenticationHandler");

const routes = express.Router();

routes
  .route("/")
  .get(getHubBookings)
  .post(roleCheck(["startup"]), createHubBooking);

routes
  .route("/:id/approve")
  .patch(roleCheck(["hub_manager"]), approveHubBooking);
routes.route("/:id/confirm").patch(roleCheck(["startup"]), confirmHubBooking);

module.exports = routes;
