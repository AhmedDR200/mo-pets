const express = require("express");
const router = express.Router();

const {
  getAllSliders,
  getSliderById,
  createSlider,
  deleteSlider,
  getActiveSliders,
  toggleSliderStatus,
} = require("../controllers/slider.controller");

const { uploadSingleImage } = require("../middleware/upload.middleware");

// Public routes
router.get("/active", getActiveSliders);

// Admin routes
router.route("/")
  .get(getAllSliders)
  .post(uploadSingleImage, createSlider);

router.route("/:id")
  .get(getSliderById)
  .delete(deleteSlider);

router.patch("/:id/toggle-status", toggleSliderStatus);

module.exports = router;