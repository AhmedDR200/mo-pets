const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'SubCategory name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'SubCategory description is required'],
    },
    image: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

subCategorySchema.index({ name: 1, category: 1 }, { unique: true });
subCategorySchema.index({ category: 1 });
subCategorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);
