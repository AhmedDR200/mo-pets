const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Offer title is required"],
      trim: true,
      minlength: [3, "Too short offer title"],
      maxlength: [100, "Too long offer title"],
    },
    description: {
      type: String,
      required: [true, "Offer description is required"],
      minlength: [20, "Too short offer description"],
    },
    discount: {
      type: Number,
      required: [true, "Offer discount is required"],
      min: [1, "Discount cannot be less than 1%"],
      max: [99, "Discount cannot be more than 99%"],
    },
    startDate: {
      type: Date,
      required: [true, "Offer start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Offer end date is required"],
    },
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: [true, "Offer must belong to at least one product"],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Middleware to populate products when finding offers
offerSchema.pre(/^find/, function (next) {
  this.populate({
    path: "products",
    select: "name wholesalePrice retailPrice image",
  });
  next();
});

// Middleware to validate that endDate is after startDate
offerSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

// Middleware to apply discount to products when offer is created
offerSchema.post("save", async function () {
  if (this.active && this.products && this.products.length > 0) {
    const Product = mongoose.model("Product");
    const now = new Date();

    // Only apply discounts if the offer is currently active
    if (now >= this.startDate && now <= this.endDate) {
      for (const productId of this.products) {
        const product = await Product.findById(productId);
        if (product) {
          const originalRetailPrice = product.hasActiveOffer
            ? product.originalRetailPrice
            : product.retailPrice;

          const updateData = {
            retailPrice: originalRetailPrice * (1 - this.discount / 100),
            hasActiveOffer: true,
            activeOfferId: this._id
          };

          if (!product.hasActiveOffer) {
            updateData.originalRetailPrice = originalRetailPrice;
          }

          await Product.findByIdAndUpdate(productId, updateData);
        }
      }
    }
  }
});

// Middleware to restore original prices when offer is deleted
offerSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.products && doc.products.length > 0) {
    const Product = mongoose.model("Product");

    for (const productId of doc.products) {
      const product = await Product.findById(productId);
      if (product && product.hasActiveOffer && product.activeOfferId.equals(doc._id)) {
        await Product.findByIdAndUpdate(productId, {
          retailPrice: product.originalRetailPrice,
          hasActiveOffer: false,
          activeOfferId: null
        });
      }
    }
  }
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;