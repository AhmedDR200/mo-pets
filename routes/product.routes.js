const express = require("express");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { uploadSingleImage } = require("../middleware/upload.middleware");
const verifyWholesaleAccess = require("../middleware/wholesaleAccess.middleware");

const router = express.Router();

router.route("/").get(verifyWholesaleAccess, getProducts).post(uploadSingleImage, createProduct);

router
  .route("/:id")
  .get(verifyWholesaleAccess, getProduct)
  .patch(uploadSingleImage, updateProduct)
  .delete(deleteProduct);

module.exports = router;
