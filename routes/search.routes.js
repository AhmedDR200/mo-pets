const express = require("express");
const router = express.Router();
const verifyWholesaleAccess = require("../middleware/wholesaleAccess.middleware");
const searchController = require("../controllers/search.controller");

router.get("/", verifyWholesaleAccess, searchController.searchAll);

module.exports = router;