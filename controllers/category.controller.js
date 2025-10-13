const mongoose = require("mongoose");
const Category = require("../models/Category.model");
const SubCategory = require("../models/SubCategory.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/apiError.util");

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const sort = query.sort || "-createdAt";
  return { page, limit, sort, skip: (page - 1) * limit };
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return next(new ApiError("Category name is required", 400));
    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return next(new ApiError("Category name already exists", 409));
    const category = await Category.create({
      name: name.trim(),
      description,
      image,
    });
    res.status(201).json({ status: "success", data: category });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const { page, limit, sort, skip } = parsePagination(req.query);
    const total = await Category.countDocuments();
    const data = await Category.find().sort(sort).skip(skip).limit(limit);
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

exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(new ApiError("Invalid category id", 400));
    const data = await Category.findById(id);
    if (!data) return next(new ApiError("Category not found", 404));
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(new ApiError("Invalid category id", 400));
    if (req.body.name) {
      const exists = await Category.findOne({
        name: req.body.name.trim(),
        _id: { $ne: id },
      });
      if (exists)
        return next(new ApiError("Category name already exists", 409));
    }
    const data = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!data) return next(new ApiError("Category not found", 404));
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};
