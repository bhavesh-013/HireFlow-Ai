const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HireFlow AI Backend API',
      version: '4.0.0',
      description:
        'Production-Ready HireFlow AI RESTful API supporting Authentication, Resume Builder & Versioning, ATS Scoring, JD Match, AI Suggestions, AI Career Coach, and Dashboard Analytics.',
      contact: {
        name: 'HireFlow AI Engineering',
        email: 'engineering@hireflow.ai',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: '/api/v1',
        description: 'Current Production Ingress',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT token obtained from /auth/login or /auth/register',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
