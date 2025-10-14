const mongoose = require("mongoose");
const dotenv = require("dotenv");
const figlet = require("figlet");
const colors = require("colors");

dotenv.config();

let cachedConnection = null;
let connectPromise = null;

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Establishes (or reuses) a MongoDB connection.
 * Ensures we never run handlers before the connection is ready,
 * which avoids intermittent buffering timeouts in serverless environments.
 */
const dbConnection = async () => {
  const { readyState } = mongoose.connection;
  if (readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  if (readyState === 2 && connectPromise) {
    return connectPromise;
  }

  if (cachedConnection && readyState === 2) {
    return cachedConnection;
  }

  if (!connectPromise) {
    const maxPoolSize = parseNumber(process.env.DB_MAX_POOL_SIZE, 10);
    const serverSelectionTimeoutMS = parseNumber(
      process.env.DB_SELECTION_TIMEOUT_MS,
      10000,
    );

    connectPromise = mongoose
      .connect(process.env.DB_URI, {
        maxPoolSize,
        serverSelectionTimeoutMS,
      })
      .then((connection) => {
        cachedConnection = connection.connection;
        figlet("DB Connected!", (err, data) => {
          if (err) {
            console.error("Figlet error:", err);
            return;
          }
          console.log(data.green);
          console.log(
            `[${new Date().toISOString()}] Database connection was successful!`
              .blue.bold,
          );
        });
        return cachedConnection;
      })
      .catch((error) => {
        connectPromise = null;
        console.error(
          `[${new Date().toISOString()}] ❌ DB Connection Failed:`.red.bold,
          error,
        );
        throw error;
      });
  }

  return connectPromise;
};

module.exports = dbConnection;
