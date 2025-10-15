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
  const sort = query.sort || "-createdAt";
  return { page, limit, sort, skip: (page - 1) * limit };
};