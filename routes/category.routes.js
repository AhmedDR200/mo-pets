const express = require("express");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { uploadSingleImage } = require("../middleware/upload.middleware");

const router = express.Router();

router.route("/").get(getCategories).post(uploadSingleImage, createCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(uploadSingleImage, updateCategory)
  .delete(deleteCategory);

module.exports = router;
