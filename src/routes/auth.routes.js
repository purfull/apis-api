const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/get-auth-token", authController.generateAuthToken);

module.exports = router;
