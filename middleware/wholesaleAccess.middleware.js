const jwt = require("jsonwebtoken");

const ApiError = require("../utils/apiError.util");

const WHOLESALE_JWT_SECRET = process.env.WHOLESALE_JWT_SECRET;

module.exports = (req, res, next) => {
  req.wholesaleAccessGranted = false;

  const authHeader = req.headers.authorization || "";
  if (!authHeader) return next();

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      new ApiError("Invalid wholesale access token format", 401),
    );
  }

  if (!WHOLESALE_JWT_SECRET) {
    return next(
      new ApiError(
        "Wholesale access is not configured on this server. Contact the administrator.",
        500,
      ),
    );
  }

  try {
    const payload = jwt.verify(token, WHOLESALE_JWT_SECRET);
    if (payload.type !== "wholesaleAccess") {
      throw new Error("Unexpected token type");
    }
    req.wholesaleAccessGranted = true;
    req.wholesaleAccessEmail = payload.email;
    return next();
  } catch (error) {
    return next(
      new ApiError("Invalid or expired wholesale access token", 401),
    );
  }
};

