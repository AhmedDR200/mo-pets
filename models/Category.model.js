const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Category description is required"],
    },
    image: { type: String, trim: true },
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
    subCategories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SubCategory",
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Category", categorySchema);
