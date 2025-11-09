const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError.util");
const { notifyAdminWithOtp } = require("../utils/email.util");
const WholesaleAccessToken = require("../models/WholesaleAccessToken.model");

const WHOLESALE_TOKEN_TTL_HOURS = 2;
const WHOLESALE_JWT_SECRET = process.env.WHOLESALE_JWT_SECRET;
const WHOLESALE_JWT_EXPIRES_IN =
  process.env.WHOLESALE_JWT_EXPIRES_IN ||
  `${WHOLESALE_TOKEN_TTL_HOURS}h`;

const ensureWholesaleSecretConfigured = () => {
  if (!WHOLESALE_JWT_SECRET) {
    throw new Error(
      "WHOLESALE_JWT_SECRET environment variable is not configured.",
    );
  }
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000)
    .toString()
    .padStart(6, "0");

exports.requestWholesaleAccess = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError("Email is required to request wholesale access", 400);
  }

  ensureWholesaleSecretConfigured();

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + WHOLESALE_TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await WholesaleAccessToken.create({
    email,
    otpHash,
    expiresAt,
    meta: {
      ip: req.ip,
      userAgent: req.get("user-agent") || null,
    },
  });

  await notifyAdminWithOtp({ otp, requestEmail: email });

  res.status(202).json({
    status: "success",
    message:
      "Wholesale access request submitted. An administrator will share the passcode with you.",
  });
});

exports.verifyWholesaleOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(
      new ApiError("Email and OTP are required to verify wholesale access", 400),
    );
  }

  ensureWholesaleSecretConfigured();

  const pendingToken = await WholesaleAccessToken.findOne({
    email,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .select("+otpHash");

  if (!pendingToken) {
    return next(new ApiError("No valid OTP found or OTP has expired", 401));
  }

  const isMatch = await bcrypt.compare(otp, pendingToken.otpHash);

  if (!isMatch) {
    return next(new ApiError("Invalid OTP code", 401));
  }

  pendingToken.usedAt = new Date();
  await pendingToken.save();

  const token = jwt.sign(
    {
      email,
      type: "wholesaleAccess",
    },
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

