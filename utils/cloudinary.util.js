const cloudinary = require("../config/cloudinary");

/**
 * Upload a buffer to Cloudinary using data URI.
 * @param {Buffer} buffer - Image buffer from Multer memory storage
 * @param {string} mimetype - MIME type (e.g., image/png)
 * @param {string} folder - Cloudinary folder name
 * @param {object} [options] - Additional Cloudinary options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadBufferToCloudinary = async (
  buffer,
  mimetype,
  folder,
  options = {},
) => {
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${base64}`;
  const uploadOptions = { folder, ...options };
  return cloudinary.uploader.upload(dataUri, uploadOptions);
};

module.exports = { uploadBufferToCloudinary };
