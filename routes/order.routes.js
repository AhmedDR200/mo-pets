const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

const router = express.Router();

router.route("/").post(createOrder).get(getOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/status").patch(updateOrderStatus);

module.exports = router;
