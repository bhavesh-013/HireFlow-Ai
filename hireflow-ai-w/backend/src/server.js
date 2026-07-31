const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');

// Connect to MongoDB Atlas
connectDB();

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 HireFlow AI Backend API - Production Ready`);
  console.log(`Environment  : ${config.env}`);
  console.log(`Server Port  : ${PORT}`);
  console.log(`Health Check : http://localhost:${PORT}/api/v1/health`);
  console.log(`API Specs    : http://localhost:${PORT}/docs`);
  console.log('====================================================');
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Received signal. Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP Server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB connection shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds timeout
  setTimeout(() => {
    console.error('Forced shutdown due to 10s timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
  if (config.env === 'production') {
    server.close(() => process.exit(1));
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception Error]: ${err.message}`);
  if (config.env === 'production') {
    process.exit(1);
  }
});
