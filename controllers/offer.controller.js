const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Offer = require("../models/Offer.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/apiError.util");
const { parsePagination } = require("../utils/helpers.util");

/**
 * @desc    Create a new offer
 * @route   POST /api/offers
 * @access  Private/Admin
 */
const createOffer = asyncHandler(async (req, res) => {
  // Check if all products exist
  if (req.body.products && req.body.products.length > 0) {
    const products = await Product.find({
      _id: { $in: req.body.products },
    });
    
    if (products.length !== req.body.products.length) {
      throw new ApiError("Some products do not exist", 404);
    }
    
    // Check if any products already have active offers
    const productsWithOffers = products.filter(product => product.hasActiveOffer);
    if (productsWithOffers.length > 0) {
      const productNames = productsWithOffers.map(p => p.name).join(", ");
      throw new ApiError(`Some products already have active offers: ${productNames}`, 400);
    }
  }

  const offer = await Offer.create(req.body);
  
  // The price updates are handled by the Offer model middleware
  
  res.status(201).json({
    status: "success",
    data: offer,
  });
});

/**
 * @desc    Get all offers
 * @route   GET /api/offers
 * @access  Public
 */
const getOffers = asyncHandler(async (req, res) => {
  const { page, limit, sort, skip } = parsePagination(req.query);
  
  // Build filter object
  const filter = {};
  if (req.query.active) {
    filter.active = req.query.active === "true";
  }
  
  // Filter for current active offers (if requested)
  if (req.query.current === "true") {
    const now = new Date();
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  }

  const offers = await Offer.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalOffers = await Offer.countDocuments(filter);

  res.status(200).json({
    status: "success",
    results: offers.length,
    paginationInfo: {
      currentPage: page,
      totalPages: Math.ceil(totalOffers / limit),
      limit,
      totalDocuments: totalOffers,
    },
    data: offers,
  });
});

/**
 * @desc    Get specific offer by id
 * @route   GET /api/offers/:id
 * @access  Public
 */
const getOffer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const offer = await Offer.findById(id);
  
  if (!offer) {
    throw new ApiError(`No offer found for id ${id}`, 404);
  }
  
  res.status(200).json({
    status: "success",
    data: offer,
  });
});

/**
 * @desc    Update specific offer
 * @route   PATCH /api/offers/:id
 * @access  Private/Admin
 */
const updateOffer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if products exist if included in update
  if (req.body.products && req.body.products.length > 0) {
    const products = await Product.find({
      _id: { $in: req.body.products },
    });
    
    if (products.length !== req.body.products.length) {
      throw new ApiError("Some products do not exist", 404);
    }
    
    // Get current offer to check which products are being removed
    const currentOffer = await Offer.findById(id);
    if (!currentOffer) {
      throw new ApiError(`No offer found for id ${id}`, 404);
    }
    
    // Reset prices for products being removed from the offer
    const productsBeingRemoved = currentOffer.products.filter(
      p => !req.body.products.includes(p.toString())
    );
    
    if (productsBeingRemoved.length > 0) {
      for (const productId of productsBeingRemoved) {
        const product = await Product.findById(productId);
        if (product && product.hasActiveOffer && product.activeOfferId.equals(id)) {
          await Product.findByIdAndUpdate(productId, {
            price: product.originalPrice,
            hasActiveOffer: false,
            activeOfferId: null
          });
        }
      }
    }
    
    // Check if new products already have active offers
    const newProductIds = req.body.products.filter(
      p => !currentOffer.products.map(cp => cp.toString()).includes(p)
    );
    
    if (newProductIds.length > 0) {
      const newProducts = products.filter(p => newProductIds.includes(p._id.toString()));
      const productsWithOffers = newProducts.filter(p => p.hasActiveOffer);
      
      if (productsWithOffers.length > 0) {
        const productNames = productsWithOffers.map(p => p.name).join(", ");
        throw new ApiError(`Some products already have active offers: ${productNames}`, 400);
      }
    }
  }
  
  // Check date validation if both dates are provided
  if (req.body.startDate && req.body.endDate) {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    
    if (endDate <= startDate) {
      throw new ApiError("End date must be after start date", 400);
    }
  }
  
  // If offer is being deactivated, restore original prices
  if (req.body.active === false) {
    const currentOffer = await Offer.findById(id);
    if (currentOffer && currentOffer.active) {
      for (const productId of currentOffer.products) {
        const product = await Product.findById(productId);
        if (product && product.hasActiveOffer && product.activeOfferId.equals(id)) {
          await Product.findByIdAndUpdate(productId, {
            price: product.originalPrice,
            hasActiveOffer: false,
            activeOfferId: null
          });
        }
      }
    }
  }
  
  const offer = await Offer.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!offer) {
    throw new ApiError(`No offer found for id ${id}`, 404);
  }
  
  res.status(200).json({
    status: "success",
    data: offer,
  });
});

/**
 * @desc    Delete specific offer
 * @route   DELETE /api/offers/:id
 * @access  Private/Admin
 */
const deleteOffer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const offer = await Offer.findByIdAndDelete(id);
  
  if (!offer) {
    throw new ApiError(`No offer found for id ${id}`, 404);
  }
  
  // Reset prices for all products in this offer
  // Note: This is now handled by the Offer model post-delete middleware
  
  res.status(204).send();
});

module.exports = {
  createOffer,
  getOffers,
  getOffer,
  updateOffer,
  deleteOffer,
};