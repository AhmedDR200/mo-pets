const cron = require('node-cron');
const Product = require('../models/Product.model');
const Offer = require('../models/Offer.model');

/**
 * Scheduled task to check for expired offers and restore original product prices
 * Runs every hour
 */
const processExpiredOffers = async () => {
  try {
    const now = new Date();

    // Find expired offers that are still active
    const expiredOffers = await Offer.find({
      endDate: { $lt: now },
      active: true
    });

    console.log(`Found ${expiredOffers.length} expired offers to process`);

    // Process each expired offer
    for (const offer of expiredOffers) {
      // Deactivate the offer
      offer.active = false;
      await offer.save();

      console.log(`Deactivated expired offer: ${offer._id} - ${offer.title}`);

      // Restore original prices for all products in this offer
      const productsToUpdate = await Product.find({
        _id: { $in: offer.products },
        hasActiveOffer: true,
        activeOfferId: offer._id
      });

      for (const product of productsToUpdate) {
        const updateData = {
          hasActiveOffer: false,
          activeOfferId: null
        };

        // Restore retail price if it was discounted
        if (offer.priceTypes && offer.priceTypes.includes("retailPrice")) {
          if (product.originalRetailPrice) {
            updateData.retailPrice = product.originalRetailPrice;
          } else {
            console.warn(`Cannot restore retail price for product ${product._id}: originalRetailPrice is missing`);
          }
        }

        // Restore wholesale price if it was discounted
        if (offer.priceTypes && offer.priceTypes.includes("wholesalePrice")) {
          if (product.originalWholesalePrice) {
            updateData.wholesalePrice = product.originalWholesalePrice;
          } else {
            console.warn(`Cannot restore wholesale price for product ${product._id}: originalWholesalePrice is missing`);
          }
        }


        await Product.findByIdAndUpdate(product._id, updateData);

        const priceTypesRestored = [];
        if (updateData.retailPrice) priceTypesRestored.push("retail");
        if (updateData.wholesalePrice) priceTypesRestored.push("wholesale");
        console.log(`Restored original ${priceTypesRestored.join(" and ")} price(s) for product: ${product._id} - ${product.name}`);
      }
    }

    console.log('Completed processing expired offers');
  } catch (error) {
    console.error('Error processing expired offers:', error);
  }
};

const scheduleOfferExpirationCheck = () => {
  // Schedule task to run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled task: Checking for expired offers...');
    await processExpiredOffers();
  });

  console.log('Offer expiration scheduler initialized');

  // Run once immediately on initialization to catch already expired offers
  processExpiredOffers();
};

module.exports = { scheduleOfferExpirationCheck };