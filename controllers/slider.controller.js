const asyncHandler = require("express-async-handler");
const Slider = require("../models/Slider.model");
const ApiError = require("../utils/apiError.util");
const { uploadBufferToCloudinary } = require("../utils/cloudinary.util");
const { parsePagination } = require("../utils/helpers.util");

/**
 * Get all slider images
 * @returns {Promise<void>}
 */
exports.getAllSliders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  
  const sliders = await Slider.find()
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const totalCount = await Slider.countDocuments();
  
  res.status(200).json({
    status: "success",
    results: sliders.length,
    totalCount,
    page,
    limit,
    data: sliders,
  });
});

/**
 * Get slider by ID
 * @param {string} id - Slider ID
 * @returns {Promise<void>}
 */
exports.getSliderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const slider = await Slider.findById(id);
  
  if (!slider) {
    return next(new ApiError(`No slider found with ID: ${id}`, 404));
  }
  
  res.status(200).json({
    status: "success",
    data: slider,
  });
});

/**
 * Create a new slider
 * @param {string} image - Image URL or base64 image
 * @param {string} [alt] - Image alt text
 * @param {boolean} [active] - Is slider active
 * @param {number} [order] - Display order
 * @returns {Promise<void>}
 */
exports.createSlider = asyncHandler(async (req, res) => {
  const { alt, active, order } = req.body;
  
  let imageUrl;
  
  // If image is a file buffer from multer, upload to cloudinary
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype, "sliders");
    imageUrl = result.secure_url;
  } else if (req.body.image) {
    imageUrl = req.body.image;
  } else {
    return res.status(400).json({
      status: "error",
      message: "Image is required. Please upload an image file or provide an image URL."
    });
  }
  
  const slider = await Slider.create({
    image: imageUrl,
    alt: alt || "Slider image",
    active: active !== undefined ? active : true,
    order: order || 0,
  });
  
  res.status(201).json({
    status: "success",
    data: slider,
  });
});

/**
 * Delete slider by ID
 * @param {string} id - Slider ID
 * @returns {Promise<void>}
 */
exports.deleteSlider = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const slider = await Slider.findByIdAndDelete(id);
  
  if (!slider) {
    return next(new ApiError(`No slider found with ID: ${id}`, 404));
  }
  
  res.status(204).send();
});

/**
 * Get active sliders
 * @returns {Promise<void>}
 */
exports.getActiveSliders = asyncHandler(async (req, res) => {
  const sliders = await Slider.find({ active: true }).sort({ order: 1 });
  
  res.status(200).json({
    status: "success",
    results: sliders.length,
    data: sliders,
  });
});

/**
 * Toggle slider active status
 * @param {string} id - Slider ID
 * @returns {Promise<void>}
 */
exports.toggleSliderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const slider = await Slider.findById(id);
  
  if (!slider) {
    return next(new ApiError(`No slider found with ID: ${id}`, 404));
  }
  
  slider.active = !slider.active;
  await slider.save();
  
  res.status(200).json({
    status: "success",
    data: slider,
  });
});