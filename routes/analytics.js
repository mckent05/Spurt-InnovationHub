const express = require("express");

const router = express.Router();

const usageMetrics = require("../controllers/analytics");
const { roleCheck } = require("../middleWare/authenticationHandler");

router.route("/").get(roleCheck("admin"), usageMetrics)

module.exports = router