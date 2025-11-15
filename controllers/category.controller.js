const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Category = require("../models/Category.model");
const SubCategory = require("../models/SubCategory.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/apiError.util");
const { uploadBufferToCloudinary } = require("../utils/cloudinary.util");
const { parsePagination } = require("../utils/helpers.util");

/**
 * Create a new category.
 * @param {string} name - Category name
 * @param {string} [description] - Category description
 * @param {string} [image] - Category image URL
 * @returns {Promise<void>}
 */
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image } = req.body;
  if (!name) return next(new ApiError("Category name is required", 400));
  const exists = await Category.findOne({ name: name.trim() });
  if (exists) return next(new ApiError("Category name already exists", 409));
  let imageUrl = image;
  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "categories",
      );
      imageUrl = result.secure_url;
    } catch (e) {
      return next(new ApiError("Image upload failed", 400));
    }
  }
  const category = await Category.create({
    name: name.trim(),
    description,
    image: imageUrl,
  });
  res.status(201).json({ status: "success", data: category });
});

/**
 * Get all categories with pagination.
 * @param {string} page - Page number (default: 1)
 * @param {string} limit - Number of items per page (default: 10)
 * @param {string} sort - Sort order (default: "-createdAt")
 * @returns {Promise<void>}
 */
exports.getCategories = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, skip } = parsePagination(req.query);
  const total = await Category.countDocuments();
  const data = await Category.find().sort(sort).skip(skip).limit(limit);
  res.status(200).json({
    status: "success",
    results: data.length,
    pagination: { page, limit, total },
    data,
  });
});

/**
 * Get a category by ID with paginated products.
 * @param {string} id - Category ID
 * @param {string} page - Page number for products (default: 1)
 * @param {string} limit - Number of products per page (default: 10)
 * @param {string} sort - Sort order for products (default: "-createdAt")
 * @returns {Promise<void>}
 */
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid category id", 400));

  // Get category with subCategories (no products yet)
  const category = await Category.findById(id)
    .populate({ path: "subCategories" });

  if (!category) return next(new ApiError("Category not found", 404));

  // Parse pagination parameters for products
  const { page, limit, sort, skip } = parsePagination(req.query);

  // Build product query - filter by category
  const productFilter = { category: id };

  // Get total count of products in this category
  const totalProducts = await Product.countDocuments(productFilter);

  // Build select based on wholesale access
  const productSelect = req.wholesaleAccessGranted === true
    ? "-__v"
    : "-__v -wholesalePrice";

  // Fetch paginated products
  const products = await Product.find(productFilter)
    .select(productSelect)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Convert category to object and add paginated products
  const categoryObj = category.toObject();
  categoryObj.products = products;
  categoryObj.pagination = {
    page,
    limit,
    total: totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
  };

  res.status(200).json({ status: "success", data: categoryObj });
});

/**
 * Update a category by ID.
 * @param {string} id - Category ID
 * @returns {Promise<void>}
 */
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid category id", 400));
  if (req.body.name) {
    const exists = await Category.findOne({
      name: req.body.name.trim(),
      _id: { $ne: id },
    });
    if (exists) return next(new ApiError("Category name already exists", 409));
  }
  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "categories",
      );
      req.body.image = result.secure_url;
    } catch (e) {
      return next(new ApiError("Image upload failed", 400));
    }
  }
  const data = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!data) return next(new ApiError("Category not found", 404));
  res.status(200).json({ status: "success", data });
});

/**
 * Delete a category by ID, along with its subcategories and products.
 * @param {string} id - Category ID
 * @returns {Promise<void>}
 */
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid category id", 400));
  const category = await Category.findById(id);
  if (!category) return next(new ApiError("Category not found", 404));
  const subCats = await SubCategory.find({ category: id });
  const subCatIds = subCats.map((s) => s._id);
  await Product.deleteMany({
    $or: [{ category: id }, { subCategory: { $in: subCatIds } }],
  });
  await SubCategory.deleteMany({ category: id });
  await Category.findByIdAndDelete(id);
  res.status(200).json({ status: "success", message: "Category deleted" });
});
