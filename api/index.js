const app = require('../app');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Failed to establish database connection for request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
