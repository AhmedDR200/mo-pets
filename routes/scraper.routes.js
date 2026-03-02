const express = require("express");
const { runScraper, getScraperStatus } = require("../controllers/scraper.controller");

const router = express.Router();

router.post("/run", runScraper);
router.get("/status", getScraperStatus);

module.exports = router;
