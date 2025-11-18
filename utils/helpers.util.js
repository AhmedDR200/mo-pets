/**
 * Helper utility functions for the application
 */

/**
 * Parse pagination parameters from query
 * @param {Object} query - Express request query object
 * @returns {Object} Pagination parameters
 */
exports.parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);

  // Map sort options for price sorting
  const sortMap = {
    minWholesalePrice: "wholesalePrice",
    maxWholesalePrice: "-wholesalePrice",
    minRetailPrice: "retailPrice",
    maxRetailPrice: "-retailPrice",
  };

  // Use mapped sort if provided, otherwise use the sort directly or default
  const sortQuery = query.sort || "-createdAt";
  const sort = sortMap[sortQuery] || sortQuery;

  return { page, limit, sort, skip: (page - 1) * limit };
};