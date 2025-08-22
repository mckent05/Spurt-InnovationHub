const express = require("express");

const getUser = require("../controllers/user");

const routes = express.Router();

routes.route("/").get(getUser);

module.exports = routes;
