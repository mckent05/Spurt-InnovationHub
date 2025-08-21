const express = require("express");
const {
  createPayOut,
  markPaidPayOut,
  approvePayOut,
  getPayOuts,
} = require("../controllers/payouts");
const { roleCheck } = require("../middleWare/authenticationHandler");

const routes = express.Router();

routes.route("/").get(getPayOuts).post(createPayOut);

routes.route("/:id/approve").patch(roleCheck(["admin"]), approvePayOut);
routes.route("/:id/mark-paid").patch(roleCheck(["admin"]), markPaidPayOut);

module.exports = routes;
