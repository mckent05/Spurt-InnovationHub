const express = require("express");
const {
  createPayOutMethod,
  getPayOutMethods,
  getWalletTxs,
} = require("../controllers/wallets");

const routes = express.Router();

routes.route("/").get(getWalletTxs);

routes.route("/payout-methods").post(createPayOutMethod).get(getPayOutMethods);

module.exports = routes;
