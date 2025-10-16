const express = require("express");
const {
  createOffer,
  getOffers,
  getOffer,
  updateOffer,
  deleteOffer,
} = require("../controllers/offer.controller");

const router = express.Router();

router.route("/")
  .post(createOffer)
  .get(getOffers);

router.route("/:id")
  .get(getOffer)
  .patch(updateOffer)
  .delete(deleteOffer);

module.exports = router;