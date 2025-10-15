const express = require("express");
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategory.controller");
const { uploadSingleImage } = require("../middleware/upload.middleware");

const router = express.Router();

router
  .route("/")
  .get(getSubCategories)
  .post(uploadSingleImage, createSubCategory);

router
  .route("/:id")
  .get(getSubCategory)
  .patch(uploadSingleImage, updateSubCategory)
  .delete(deleteSubCategory);

module.exports = router;
