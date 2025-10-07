const mongoose = require('mongoose');
const dotenv = require('dotenv');
const figlet = require('figlet');
const colors = require('colors');

dotenv.config();

let connectionPromise;
let hasLoggedSuccess = false;

const logSuccess = () => {
  if (hasLoggedSuccess) {
    return;
  }

  hasLoggedSuccess = true;
  figlet('DB Connected!', (err, data) => {
    if (err) {
      console.error('Figlet error:', err);
      return;
    }
    console.log(data.green);
    console.log(
      `[${new Date().toISOString()}] Database connection was successful!`.blue
        .bold,
    );
  });
};

const dbConnection = async () => {
  if (!process.env.DB_URI) {
    throw new Error('DB_URI is not defined in the environment variables.');
  }

  if (mongoose.connection.readyState === 1) {
    logSuccess();
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(process.env.DB_URI)
    .then((mongooseInstance) => {
      logSuccess();
      return mongooseInstance.connection;
    })
    .catch((error) => {
      connectionPromise = undefined;
      console.error(
        `[${new Date().toISOString()}] ❌ DB Connection Failed:`.red.bold,
        error,
      );
      throw error;
    });

  return connectionPromise;
};

module.exports = dbConnection;
