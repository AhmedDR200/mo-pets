const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price must be greater than 0'],
    },
    description: { type: String, trim: true },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Product stock must be greater than 0'],
    },
    image: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

productSchema.index({ name: 1, category: 1, subCategory: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
