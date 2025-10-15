const express = require("express");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { uploadSingleImage } = require("../middleware/upload.middleware");

const router = express.Router();

router.route("/").get(getProducts).post(uploadSingleImage, createProduct);

router.route("/:id").get(getProduct).patch(uploadSingleImage, updateProduct).delete(deleteProduct);

module.exports = router;
