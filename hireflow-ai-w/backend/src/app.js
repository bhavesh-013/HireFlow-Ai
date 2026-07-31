const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const swaggerSpec = require('./config/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const templateRoutes = require('./routes/templateRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const importRoutes = require('./routes/importRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Compression middleware
app.use(compression());

// Security HTTP headers
app.use(helmet());

// NoSQL Injection Sanitization
app.use(mongoSanitize());

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      config.env === 'development' ||
      origin === config.clientUrl ||
      origin.startsWith('http://localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// HTTP Request Logger
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger OpenAPI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Apply Rate Limiting to all API routes
app.use('/api', apiLimiter);

// API v1 Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/ai', aiRoutes);

// Unversioned aliases for maximum client compatibility
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/import', importRoutes);
app.use('/api/ai', aiRoutes);

// Base route greeting
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to HireFlow AI Backend API - Production Ready (Phase 4)',
    version: '4.0.0',
    documentation: '/docs',
    swaggerJson: '/swagger.json',
  });
});

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
