const express = require("express");
const {
  createOffer,
  getOffers,
  getOffer,
  updateOffer,
  deleteOffer,
} = require("../controllers/offer.controller");
const verifyWholesaleAccess = require("../middleware/wholesaleAccess.middleware");

const router = express.Router();

router.route("/")
  .post(createOffer)
  .get(verifyWholesaleAccess, getOffers);

router.route("/:id")
  .get(verifyWholesaleAccess, getOffer)
  .patch(updateOffer)
  .delete(deleteOffer);

module.exports = router;