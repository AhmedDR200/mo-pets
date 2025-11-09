const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
const SubCategory = require("../models/SubCategory.model");
const Offer = require("../models/Offer.model");
const asyncHandler = require('express-async-handler');

/**
 * Search across all data types (products, categories, subcategories, offers)
 * @route GET /api/search
 */
exports.searchAll = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      status: "error",
      message: "Search query is required",
    });
  }

  // Create regex pattern for case-insensitive search
  const searchPattern = new RegExp(query, "i");

  // Search in parallel for better performance
  const [products, categories, subCategories, offers] = await Promise.all([
    // Search products by name and description
    Product.find({
      $or: [
        { name: { $regex: searchPattern } },
        { description: { $regex: searchPattern } }
      ]
    }).populate("category subCategory"),

    // Search categories by name and description
    Category.find({
      $or: [
        { name: { $regex: searchPattern } },
        { description: { $regex: searchPattern } }
      ]
    }),

    // Search subcategories by name and description
    SubCategory.find({
      $or: [
        { name: { $regex: searchPattern } },
        { description: { $regex: searchPattern } }
      ]
    }).populate("category"),

    // Search offers by name and description
    Offer.find({
      $or: [
        { name: { $regex: searchPattern } },
        { description: { $regex: searchPattern } }
      ]
    })
  ]);

  // Return combined search results
  const sanitizedProducts = products.map(product => {
    const productObj = product.toObject();
    if (!req.wholesaleAccessGranted) {
      delete productObj.wholesalePrice;
    }
    return productObj;
  });

  const sanitizedOffers = offers.map(offer => {
    const offerObj = offer.toObject();
    if (!req.wholesaleAccessGranted && Array.isArray(offerObj.products)) {
      offerObj.products = offerObj.products.map(product => {
        const productClone = { ...product };
        delete productClone.wholesalePrice;
        return productClone;
      });
    }
    return offerObj;
  });

  res.status(200).json({
    status: "success",
    results: {
      products: {
        count: sanitizedProducts.length,
        data: sanitizedProducts
      },
      categories: {
        count: categories.length,
        data: categories
      },
      subCategories: {
        count: subCategories.length,
        data: subCategories
      },
      offers: {
        count: sanitizedOffers.length,
        data: sanitizedOffers
      }
    }
  });
});