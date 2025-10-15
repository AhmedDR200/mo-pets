const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const SubCategory = require("../models/SubCategory.model");
const Category = require("../models/Category.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/apiError.util");
const { uploadBufferToCloudinary } = require("../utils/cloudinary.util");
const { parsePagination } = require("../utils/helpers.util");

/**
 * Create a new sub-category.
 * @param {string} name - Sub-category name
 * @param {string} description - Sub-category description
 * @param {string} [image] - Sub-category image URL
 * @param {string} category - Category ID
 * @returns {Promise<void>}
 */
exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image, category } = req.body;
  if (!name || !description || !category)
    return next(
      new ApiError("name, description and category are required", 400),
    );
  if (!mongoose.Types.ObjectId.isValid(category))
    return next(new ApiError("Invalid category id", 400));
  const cat = await Category.findById(category);
  if (!cat) return next(new ApiError("Category not found", 404));
  const exists = await SubCategory.findOne({ name: name.trim(), category });
  if (exists)
    return next(
      new ApiError("SubCategory with same name in this category exists", 409),
    );
  let imageUrl = image;
  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "subcategories",
      );
      imageUrl = result.secure_url;
    } catch (e) {
      return next(new ApiError("Image upload failed", 400));
    }
  }
  const subCategory = await SubCategory.create({
    name: name.trim(),
    description,
    image: imageUrl,
    category,
  });
  // Maintain Category.subCategories array
  await Category.updateOne(
    { _id: category },
    { $addToSet: { subCategories: subCategory._id } },
  );
  res.status(201).json({ status: "success", data: subCategory });
});

/**
 * Get all sub-categories with pagination.
 * @param {string} page - Page number (default: 1)
 * @param {string} limit - Number of items per page (default: 10)
 * @param {string} sort - Sort order (default: "-createdAt")
 * @param {string} category - Category ID (optional)
 * @returns {Promise<void>}
 */
exports.getSubCategories = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category))
    filter.category = req.query.category;
  const total = await SubCategory.countDocuments(filter);
  const data = await SubCategory.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("category", "name");
  res.status(200).json({
    status: "success",
    results: data.length,
    pagination: { page, limit, total },
    data,
  });
});

/**
 * Get a sub-category by ID.
 * @param {string} id - Sub-category ID
 * @returns {Promise<void>}
 */
exports.getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid subCategory id", 400));
  const data = await SubCategory.findById(id).populate("category", "name");
  if (!data) return next(new ApiError("SubCategory not found", 404));
  res.status(200).json({ status: "success", data });
});

/**
 * Update a sub-category by ID.
 * @param {string} id - Sub-category ID
 * @returns {Promise<void>}
 */
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid subCategory id", 400));
  const current = await SubCategory.findById(id);
  if (!current) return next(new ApiError("SubCategory not found", 404));
  if (req.body.category) {
    if (!mongoose.Types.ObjectId.isValid(req.body.category))
      return next(new ApiError("Invalid category id", 400));
    const cat = await Category.findById(req.body.category);
    if (!cat) return next(new ApiError("Category not found", 404));
    if (String(current.category) !== String(req.body.category)) {
      // Move products to new category and update category arrays
      const productIds = await Product.find({ subCategory: id }).distinct(
        "_id",
      );
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { category: req.body.category } },
      );
      await Category.updateOne(
        { _id: current.category },
        { $pull: { subCategories: id, products: { $in: productIds } } },
      );
      await Category.updateOne(
        { _id: req.body.category },
        { $addToSet: { subCategories: id, products: { $each: productIds } } },
      );
    }
  }
  // Use the effective category (new or current) when checking for duplicate name
  const categoryForCheck = req.body.category
    ? req.body.category
    : current.category;
  if (req.body.name) {
    const exists = await SubCategory.findOne({
      name: req.body.name.trim(),
      category: categoryForCheck,
      _id: { $ne: id },
    });
    if (exists)
      return next(
        new ApiError("SubCategory with same name in this category exists", 409),
      );
  }
  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "subcategories",
      );
      req.body.image = result.secure_url;
    } catch (e) {
      return next(new ApiError("Image upload failed", 400));
    }
  }
  const data = await SubCategory.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!data) return next(new ApiError("SubCategory not found", 404));
  res.status(200).json({ status: "success", data });
});

/**
 * Delete a sub-category by ID, along with its products.
 * @param {string} id - Sub-category ID
 * @returns {Promise<void>}
 */
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid subCategory id", 400));
  const subCat = await SubCategory.findById(id);
  if (!subCat) return next(new ApiError("SubCategory not found", 404));
  // Remove subCategory and its products from Category arrays
  const productIds = await Product.find({ subCategory: id }).distinct("_id");
  await Category.updateOne(
    { _id: subCat.category },
    { $pull: { subCategories: id, products: { $in: productIds } } },
  );
  await Product.deleteMany({ subCategory: id });
  await SubCategory.findByIdAndDelete(id);
  res.status(200).json({ status: "success", message: "SubCategory deleted" });
});
