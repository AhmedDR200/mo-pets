const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError.util");

const WHOLESALE_JWT_SECRET = process.env.WHOLESALE_JWT_SECRET;
const WHOLESALE_JWT_EXPIRES_IN = process.env.WHOLESALE_JWT_EXPIRES_IN || "2h";
const FIXED_OTP = "606560";

const ensureWholesaleSecretConfigured = () => {
  if (!WHOLESALE_JWT_SECRET) {
    throw new Error(
      "WHOLESALE_JWT_SECRET environment variable is not configured.",
    );
  }
};

exports.verifyWholesaleOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new ApiError("OTP is required to verify wholesale access", 400));
  }

  ensureWholesaleSecretConfigured();

  if (otp !== FIXED_OTP) {
    return next(new ApiError("Invalid OTP code", 401));
  }

  const token = jwt.sign(
    { type: "wholesaleAccess" },
    WHOLESALE_JWT_SECRET,
    { expiresIn: WHOLESALE_JWT_EXPIRES_IN },
  );

  const expiresInMs = WHOLESALE_JWT_EXPIRES_IN.endsWith("h")
    ? Number.parseInt(WHOLESALE_JWT_EXPIRES_IN, 10) * 60 * 60 * 1000
    : 2 * 60 * 60 * 1000;

  res.status(200).json({
    status: "success",
    token,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
  });
});

