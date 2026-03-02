const asyncHandler = require("express-async-handler");
const Order = require("../models/Order.model");
const ApiError = require("../utils/apiError.util");
const { parsePagination } = require("../utils/helpers.util");

exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    customerName,
    customerPhone,
    items,
    paymentMethod,
    deliveryMethod,
    deliveryAddress,
    totalPrice,
    isWholesale,
    notes,
  } = req.body;

  if (!customerName || !customerPhone) {
    return next(new ApiError("Customer name and phone are required", 400));
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ApiError("Order must contain at least one item", 400));
  }

  if (!paymentMethod) {
    return next(new ApiError("Payment method is required", 400));
  }

  if (!deliveryMethod) {
    return next(new ApiError("Delivery method is required", 400));
  }

  if (deliveryMethod === "delivery" && (!deliveryAddress || !deliveryAddress.trim())) {
    return next(new ApiError("Delivery address is required for delivery orders", 400));
  }

  const order = await Order.create({
    customerName,
    customerPhone,
    items,
    paymentMethod,
    deliveryMethod,
    deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress : undefined,
    totalPrice,
    isWholesale: !!isWholesale,
    notes,
  });

  res.status(201).json({
    status: "success",
    data: order,
  });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const { page, limit, sort, skip } = parsePagination(req.query);

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.phone) {
    filter.customerPhone = req.query.phone;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: orders,
  });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Order deleted successfully",
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return next(
      new ApiError(`Status must be one of: ${validStatuses.join(", ")}`, 400),
    );
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});
