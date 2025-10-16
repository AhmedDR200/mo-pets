const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Slider image URL is required"],
    },
    alt: {
      type: String,
      default: "Slider image",
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

const Slider = mongoose.model("Slider", sliderSchema);

module.exports = Slider;