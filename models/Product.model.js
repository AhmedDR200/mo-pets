const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    wholesalePrice: {
      type: Number,
      required: [true, "Wholesale price is required"],
      min: [0, "Wholesale price must be greater than 0"],
    },
    retailPrice: {
      type: Number,
      required: [true, "Retail price is required"],
      min: [0, "Retail price must be greater than 0"],
    },
    originalRetailPrice: {
      type: Number,
      default: function () {
        return this.retailPrice;
      }
    },
    originalWholesalePrice: {
      type: Number,
      default: function () {
        return this.wholesalePrice;
      }
    },
    hasActiveOffer: {
      type: Boolean,
      default: false
    },
    activeOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null
    },
    description: { type: String, trim: true },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Product stock must be greater than 0"],
    },
    image: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

// Middleware to ensure original prices are set on product creation
productSchema.pre("save", function (next) {
  // Only set original prices if they're not already set (first time save)
  if (this.isNew) {
    if (!this.originalRetailPrice) {
      this.originalRetailPrice = this.retailPrice;
    }
    if (!this.originalWholesalePrice) {
      this.originalWholesalePrice = this.wholesalePrice;
    }
  }
  next();
});

productSchema.index({ name: 1, category: 1, subCategory: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ retailPrice: 1 });
productSchema.index({ wholesalePrice: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
