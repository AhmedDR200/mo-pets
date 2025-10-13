const mongoose = require("mongoose");
const Product = require("../models/Product.model");
const SubCategory = require("../models/SubCategory.model");
const Category = require("../models/Category.model");
const ApiError = require("../utils/apiError.util");

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const sort = query.sort || "-createdAt";
  return { page, limit, sort, skip: (page - 1) * limit };
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, description, stock, image, category, subCategory } =
      req.body;
    if (
      !name ||
      category == null ||
      subCategory == null ||
      price == null ||
      stock == null
    ) {
      return next(
        new ApiError(
          "name, price, stock, category and subCategory are required",
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
    const cat = await Category.findById(category);
    const subCat = await SubCategory.findById(subCategory);
    if (!cat) return next(new ApiError("Category not found", 404));
    if (!subCat) return next(new ApiError("SubCategory not found", 404));
    if (String(subCat.category) !== String(cat._id))
      return next(new ApiError("subCategory does not belong to category", 400));
    const product = await Product.create({
      name: name.trim(),
      price,
      description,
      stock,
      image,
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
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, sort, skip } = parsePagination(req.query);
    const filter = {};
    if (
      req.query.category &&
      mongoose.Types.ObjectId.isValid(req.query.category)
    )
      filter.category = req.query.category;
    if (
      req.query.subCategory &&
      mongoose.Types.ObjectId.isValid(req.query.subCategory)
    )
      filter.subCategory = req.query.subCategory;
    const total = await Product.countDocuments(filter);
    const data = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .populate("subCategory", "name");
    res.status(200).json({
      status: "success",
      results: data.length,
      pagination: { page, limit, total },
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(new ApiError("Invalid product id", 400));
    const data = await Product.findById(id)
      .populate("category", "name")
      .populate("subCategory", "name");
    if (!data) return next(new ApiError("Product not found", 404));
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
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
        return next(
          new ApiError("subCategory does not belong to category", 400),
        );
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

    const data = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};
