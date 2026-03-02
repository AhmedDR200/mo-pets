const express = require("express");

const { verifyWholesaleOtp } = require("../controllers/access.controller");

const router = express.Router();

router.post("/wholesale/verify", verifyWholesaleOtp);

module.exports = router;

