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
        product.price = product.originalPrice;
        product.hasActiveOffer = false;
        product.activeOfferId = null;
        await product.save();

        console.log(`Restored original price for product: ${product._id} - ${product.name}`);
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