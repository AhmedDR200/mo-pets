const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const SubCategory = require("../models/SubCategory.model");
const ApiError = require("../utils/apiError.util");
const { uploadBufferToCloudinary } = require("../utils/cloudinary.util");
const { parsePagination } = require("../utils/helpers.util");

/**
 * Create a new product.
 * @param {string} name - Product name
 * @param {number} wholesalePrice - Product wholesale price
 * @param {number} retailPrice - Product retail price
 * @param {string} [description] - Product description
 * @param {number} stock - Product stock quantity
 * @param {string} [image] - Product image URL
 * @param {string} category - Category ID
 * @param {string} subCategory - SubCategory ID
 * @returns {Promise<void>}
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    wholesalePrice,
    retailPrice,
    description,
    stock,
    image,
    category,
    subCategory,
  } =
    req.body;
  if (
    !name ||
    category == null ||
    subCategory == null ||
    wholesalePrice == null ||
    retailPrice == null ||
    stock == null
  ) {
    return next(
      new ApiError(
        "name, wholesalePrice, retailPrice, stock, category and subCategory are required",
        400,
      ),
    );
  }
  if (
    !mongoose.Types.ObjectId.isValid(category) ||
    !mongoose.Types.ObjectId.isValid(subCategory)
  ) {
    return next(new ApiError("Invalid category or subCategory id", 400));
  }

  if (Number(retailPrice) <= Number(wholesalePrice)) {
    return next(
      new ApiError(
        "retailPrice must be greater than wholesalePrice",
        400,
      ),
    );
  }

  const cat = await Category.findById(category);
  const subCat = await SubCategory.findById(subCategory);
  if (!cat) return next(new ApiError("Category not found", 404));
  if (!subCat) return next(new ApiError("SubCategory not found", 404));
  if (String(subCat.category) !== String(cat._id))
    return next(new ApiError("subCategory does not belong to category", 400));
  let imageUrl = image;
  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "products",
      );
      imageUrl = result.secure_url;
    } catch (e) {
      return next(new ApiError("Image upload failed", 400));
    }
  }
  const product = await Product.create({
    name: name.trim(),
    wholesalePrice,
    retailPrice,
    description,
    stock,
    image: imageUrl,
    category,
    subCategory,
  });
  await SubCategory.updateOne(
    { _id: subCategory },
    { $addToSet: { products: product._id } },
  );
  // Maintain Category.products array
  await Category.updateOne(
    { _id: category },
    { $addToSet: { products: product._id } },
  );
  res.status(201).json({ status: "success", data: product });
});

/**
 * Get all products with pagination.
 * @param {string} page - Page number (default: 1)
 * @param {string} limit - Number of items per page (default: 10)
 * @param {string} sort - Sort order (default: "-createdAt")
 * @param {string} category - Category ID (optional)
 * @param {string} subCategory - SubCategory ID (optional)
 * @param {string} name - Product name for search (optional)
 * @returns {Promise<void>}
 */
exports.getProducts = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category))
    filter.category = req.query.category;
  if (
    req.query.subCategory &&
    mongoose.Types.ObjectId.isValid(req.query.subCategory)
  )
    filter.subCategory = req.query.subCategory;
  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("category", "name")
    .populate("subCategory", "name");

  // Add offer information to response
  const productsWithOfferInfo = products.map(product => {
    const productObj = product.toObject();
    if (product.hasActiveOffer) {
      productObj.originalRetailPrice = product.originalRetailPrice;
      productObj.discountedRetailPrice = product.retailPrice;
      productObj.hasActiveOffer = true;
    }
    if (!req.wholesaleAccessGranted) {
      delete productObj.wholesalePrice;
    }
    return productObj;
  });

  res.status(200).json({
    status: "success",
    results: products.length,
    pagination: { page, limit, total },
    data: productsWithOfferInfo,
  });
});

/**
 * Get a specific product by ID.
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid product id", 400));
  }
  const product = await Product.findById(id)
    .populate("category", "name")
    .populate("subCategory", "name");
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Add offer information to response
  const productObj = product.toObject();
  if (product.hasActiveOffer) {
    productObj.originalRetailPrice = product.originalRetailPrice;
    productObj.discountedRetailPrice = product.retailPrice;
    productObj.hasActiveOffer = true;
  }
  if (!req.wholesaleAccessGranted) {
    delete productObj.wholesalePrice;
  }

  res.status(200).json({
    status: "success",
    data: productObj,
  });
});

/**
 * Update a product by ID.
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid product id", 400));
  const current = await Product.findById(id);
  if (!current) return next(new ApiError("Product not found", 404));

  if (req.body.category || req.body.subCategory) {
    const newCategoryId = req.body.category
      ? req.body.category
      : current.category;
    const newSubCategoryId = req.body.subCategory
      ? req.body.subCategory
      : current.subCategory;
    if (
      !mongoose.Types.ObjectId.isValid(newCategoryId) ||
      !mongoose.Types.ObjectId.isValid(newSubCategoryId)
    ) {
      return next(new ApiError("Invalid category or subCategory id", 400));
    }
    const cat = await Category.findById(newCategoryId);
    const subCat = await SubCategory.findById(newSubCategoryId);
    if (!cat) return next(new ApiError("Category not found", 404));
    if (!subCat) return next(new ApiError("SubCategory not found", 404));
    if (String(subCat.category) !== String(cat._id))
      return next(new ApiError("subCategory does not belong to category", 400));
    if (String(current.subCategory) !== String(newSubCategoryId)) {
      await SubCategory.updateOne(
        { _id: current.subCategory },
        { $pull: { products: current._id } },
      );
      await SubCategory.updateOne(
        { _id: newSubCategoryId },
        { $addToSet: { products: current._id } },
      );
    }
    if (String(current.category) !== String(newCategoryId)) {
      // Move product reference between categories
      await Category.updateOne(
        { _id: current.category },
        { $pull: { products: current._id } },
      );
      await Category.updateOne(
        { _id: newCategoryId },
        { $addToSet: { products: current._id } },
      );
    }
  }

  if (req.file) {
    try {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        "products",
      );
      req.body.image = result.secure_url;
    } catch (e) {
      return next(new ApiError("Image upload failed", 400));
    }
  }
  const updatePayload = { ...req.body };

  const hasWholesaleUpdate = Object.prototype.hasOwnProperty.call(
    updatePayload,
    "wholesalePrice",
  );
  const hasRetailUpdate = Object.prototype.hasOwnProperty.call(
    updatePayload,
    "retailPrice",
  );

  if (hasWholesaleUpdate || hasRetailUpdate) {
    const nextWholesalePrice = hasWholesaleUpdate
      ? Number(updatePayload.wholesalePrice)
      : Number(current.wholesalePrice);
    const nextRetailPrice = hasRetailUpdate
      ? Number(updatePayload.retailPrice)
      : Number(current.retailPrice);

    if (nextRetailPrice <= nextWholesalePrice) {
      return next(
        new ApiError(
          "retailPrice must be greater than wholesalePrice",
          400,
        ),
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(updatePayload, "retailPrice") &&
    !current.hasActiveOffer
  ) {
    updatePayload.originalRetailPrice = updatePayload.retailPrice;
  }

  const data = await Product.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: "success", data });
});

/**
 * Delete a product by ID.
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ApiError("Invalid product id", 400));
  const product = await Product.findById(id);
  if (!product) return next(new ApiError("Product not found", 404));
  await SubCategory.updateOne(
    { _id: product.subCategory },
    { $pull: { products: product._id } },
  );
  // Remove product id from Category.products
  await Category.updateOne(
    { _id: product.category },
    { $pull: { products: product._id } },
  );
  await Product.findByIdAndDelete(id);
  res.status(200).json({ status: "success", message: "Product deleted" });
});
