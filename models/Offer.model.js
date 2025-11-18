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
    priceTypes: {
      type: [String],
      enum: ["wholesalePrice", "retailPrice"],
      default: ["retailPrice"],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: "At least one price type must be selected"
      }
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
  // Ensure priceTypes has at least one value
  if (!this.priceTypes || this.priceTypes.length === 0) {
    this.priceTypes = ["retailPrice"];
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
          const updateData = {
            hasActiveOffer: true,
            activeOfferId: this._id
          };

          // Apply discount to retail price if selected
          if (this.priceTypes.includes("retailPrice")) {
            const originalRetailPrice = product.hasActiveOffer
              ? product.originalRetailPrice
              : product.retailPrice;

            updateData.retailPrice = originalRetailPrice * (1 - this.discount / 100);

            if (!product.hasActiveOffer) {
              updateData.originalRetailPrice = originalRetailPrice;
            }
          }

          // Apply discount to wholesale price if selected
          if (this.priceTypes.includes("wholesalePrice")) {
            const originalWholesalePrice = product.hasActiveOffer
              ? (product.originalWholesalePrice || product.wholesalePrice)
              : product.wholesalePrice;

            updateData.wholesalePrice = originalWholesalePrice * (1 - this.discount / 100);

            if (!product.hasActiveOffer) {
              updateData.originalWholesalePrice = originalWholesalePrice;
            }
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
        const updateData = {
          hasActiveOffer: false,
          activeOfferId: null
        };

        // Restore retail price if it was discounted
        if (doc.priceTypes && doc.priceTypes.includes("retailPrice") && product.originalRetailPrice) {
          updateData.retailPrice = product.originalRetailPrice;
        }

        // Restore wholesale price if it was discounted
        if (doc.priceTypes && doc.priceTypes.includes("wholesalePrice") && product.originalWholesalePrice) {
          updateData.wholesalePrice = product.originalWholesalePrice;
        }

        await Product.findByIdAndUpdate(productId, updateData);
      }
    }
  }
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;