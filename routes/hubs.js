const express = require("express");
const {
  getHubs,
  getHub,
  createHub,
  hubAvailability,
} = require("../controllers/hubs");
const { roleCheck } = require("../middleWare/authenticationHandler");

const routes = express.Router();

routes
  .route("/")
  .get(getHubs)
  .post(roleCheck(["hub_manager", "admin"]), createHub);

routes.route("/:id").get(getHub);

routes
  .route("/:id/availabilities")
  .post(roleCheck(["hub_manager", "admin"]), hubAvailability);

module.exports = routes;
