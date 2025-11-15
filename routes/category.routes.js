const express = require("express");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { uploadSingleImage } = require("../middleware/upload.middleware");
const verifyWholesaleAccess = require("../middleware/wholesaleAccess.middleware");

const router = express.Router();

router.route("/").get(getCategories).post(uploadSingleImage, createCategory);

router
  .route("/:id")
  .get(verifyWholesaleAccess, getCategory)
  .patch(uploadSingleImage, updateCategory)
  .delete(deleteCategory);

module.exports = router;
