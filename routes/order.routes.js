const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
} = require("../controllers/order.controller");

const router = express.Router();

router.route("/").post(createOrder).get(getOrders);
router.route("/:id").get(getOrderById).delete(deleteOrder);
router.route("/:id/status").patch(updateOrderStatus);

module.exports = router;
