const express = require("express");

const router = express.Router();

const { login, register, logout } = require("../controllers/auth");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/logout").delete(logout);

module.exports = router;
