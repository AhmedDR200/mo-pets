const express = require("express");

// Import route modules
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const subCategoryRoutes = require("./subCategory.routes");

const mountRoutes = (app) => {
  // Mount routes
  app.use("/api/categories", categoryRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/subcategories", subCategoryRoutes);

  // Health check route
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Server is running!",
      timestamp: new Date().toISOString(),
    });
  });
};

module.exports = mountRoutes;
