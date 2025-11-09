const express = require("express");

const {
  requestWholesaleAccess,
  verifyWholesaleOtp,
} = require("../controllers/access.controller");

const router = express.Router();

router.post("/wholesale/request", requestWholesaleAccess);
router.post("/wholesale/verify", verifyWholesaleOtp);

module.exports = router;

