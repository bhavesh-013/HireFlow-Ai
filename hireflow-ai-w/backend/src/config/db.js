const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri || 'mongodb://127.0.0.1:27017/hireflow_db', {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // If in production, exit with failure. In local dev without active URI, log warning.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
