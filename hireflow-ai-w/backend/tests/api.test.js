const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

describe('HireFlow AI Production API Integration Test Suite', () => {
  let authToken = '';
  let userId = '';
  let resumeId = '';

  const testUser = {
    name: 'Test Engineer',
    email: `test_${Date.now()}@hireflow.ai`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    // Connect to in-memory or test database if MONGO_URI_TEST is set, otherwise default mongo
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hireflow_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    // Clean up test collections and close connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });

  describe('1. System Health & Swagger Specs', () => {
    it('GET /api/v1/health should return 200 OK and health status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });

    it('GET /swagger.json should return valid OpenAPI 3.0 specification', async () => {
      const res = await request(app).get('/swagger.json');
      expect(res.statusCode).toBe(200);
      expect(res.body.openapi).toBe('3.0.0');
      expect(res.body.info.title).toContain('HireFlow AI');
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('POST /api/v1/auth/register should create a new user account', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());

      authToken = res.body.data.token;
      userId = res.body.data.user.id || res.body.data.user._id;
    });

    it('POST /api/v1/auth/login should authenticate user and return JWT', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('GET /api/v1/auth/me should return current user profile with bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email.toLowerCase());
    });

    it('GET /api/v1/auth/me without token should return 410 or 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect([401, 410]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Resume Management CRUD', () => {
    it('POST /api/v1/resumes should create a new resume with Version 1', async () => {
      const res = await request(app)
        .post('/api/v1/resumes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Senior Full Stack Engineer Resume',
          template: 'modern',
          resumeData: {
            personalInfo: {
              firstName: 'Test',
              lastName: 'Engineer',
              email: testUser.email,
              jobTitle: 'Senior Full Stack Engineer',
            },
            skills: [
              { id: 'sk_1', name: 'JavaScript', category: 'Frontend', level: 'Expert' },
              { id: 'sk_2', name: 'Node.js', category: 'Backend', level: 'Expert' },
            ],
          },
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Senior Full Stack Engineer Resume');
      resumeId = res.body.data._id;
    });

    it('GET /api/v1/resumes should list user resumes with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/resumes?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/resumes/:id should fetch single resume details', async () => {
      const res = await request(app)
        .get(`/api/v1/resumes/${resumeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(resumeId);
    });

    it('PUT /api/v1/resumes/:id should update resume title & details', async () => {
      const res = await request(app)
        .put(`/api/v1/resumes/${resumeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Principal Lead Resume',
          isFavorite: true,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Principal Lead Resume');
      expect(res.body.data.isFavorite).toBe(true);
    });

    it('POST /api/v1/resumes/:id/duplicate should copy resume', async () => {
      const res = await request(app)
        .post(`/api/v1/resumes/${resumeId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('(Copy)');
    });
  });

  describe('4. AI, ATS Analysis & Career Coach APIs', () => {
    it('POST /api/v1/ai/ats-analyze should return ATS score and keyword insights', async () => {
      const res = await request(app)
        .post('/api/v1/ai/ats-analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          resumeId,
          targetRole: 'Senior Full Stack Developer',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.atsScore).toBeDefined();
      expect(res.body.data.breakdown).toBeDefined();
    });

    it('POST /api/v1/ai/jd-match should perform JD match and gap analysis', async () => {
      const res = await request(app)
        .post('/api/v1/ai/jd-match')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          resumeId,
          jobDescription: 'Seeking Senior Full Stack Engineer with React, Node.js, Express, MongoDB, TypeScript, Docker, and AWS experience.',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchPercentage).toBeDefined();
      expect(res.body.data.matchedSkills).toBeDefined();
    });

    it('POST /api/v1/ai/suggest should generate AI bullet point enhancements', async () => {
      const res = await request(app)
        .post('/api/v1/ai/suggest')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          resumeId,
          section: 'experience',
          promptDetails: 'Optimize bullets for cloud infrastructure and team leadership',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.suggestions)).toBe(true);
    });

    it('POST /api/v1/ai/career-coach should return interactive advice', async () => {
      const res = await request(app)
        .post('/api/v1/ai/career-coach')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'How do I stand out when applying for Staff Engineer roles?',
          resumeId,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toBeDefined();
      expect(res.body.data.actionSteps).toBeDefined();
    });
  });

  describe('5. Dashboard Analytics', () => {
    it('GET /api/v1/dashboard/stats should return aggregate user dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalResumes).toBeDefined();
    });
  });

  describe('6. Cleanup', () => {
    it('DELETE /api/v1/resumes/:id should remove resume document', async () => {
      const res = await request(app)
        .delete(`/api/v1/resumes/${resumeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
