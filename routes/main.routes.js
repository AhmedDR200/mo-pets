const express = require("express");
const mongoose = require("mongoose");

// Import route modules
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const subCategoryRoutes = require("./subCategory.routes");
const offerRoutes = require("./offer.routes");
const sliderRoutes = require("./slider.routes");

const mountRoutes = (app) => {
  // Mount routes
  app.use("/api/categories", categoryRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/subcategories", subCategoryRoutes);
  app.use("/api/offers", offerRoutes);
  app.use("/api/sliders", sliderRoutes);

  // Health check route
  app.get("/api/health", async (req, res) => {
    const { connection } = mongoose;
    const stateLabels = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    const readyState = connection.readyState;
    let dbLatencyMs = null;
    let dbError = null;

    if (readyState === 1 && connection.db) {
      // Ping the database to verify connectivity and measure latency.
      const start = process.hrtime();
      try {
        await connection.db.admin().command({ ping: 1 });
        const diff = process.hrtime(start);
        dbLatencyMs = Number((diff[0] * 1000 + diff[1] / 1e6).toFixed(2));
      } catch (error) {
        dbError = error.message;
      }
    } else if (readyState !== 1) {
      dbError = `Database is ${stateLabels[readyState] || "unavailable"}`;
    }

    const dbHealthy = readyState === 1 && !dbError;
    const statusCode = dbHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: dbHealthy ? "success" : "error",
      message: dbHealthy
        ? "Server and database are healthy."
        : "Server is running but database check failed.",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Number(process.uptime().toFixed(2)),
      db: {
        state: stateLabels[readyState] || "unknown",
        healthy: dbHealthy,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
    });
  });
};

module.exports = mountRoutes;
