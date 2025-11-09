const mongoose = require("mongoose");

const wholesaleAccessTokenSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Requesting email is required"],
            trim: true,
            lowercase: true,
        },
        otpHash: {
            type: String,
            required: true,
            select: false,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
        usedAt: {
            type: Date,
            default: null,
        },
        meta: {
            ip: { type: String, default: null },
            userAgent: { type: String, default: null },
        },
    },
    { timestamps: true, versionKey: false },
);

wholesaleAccessTokenSchema.methods.markUsed = function markUsed() {
    this.usedAt = new Date();
    return this.save();
};

module.exports = mongoose.model(
    "WholesaleAccessToken",
    wholesaleAccessTokenSchema,
);

