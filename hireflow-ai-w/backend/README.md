# HireFlow AI - Production Ready Backend API (Phase 4 Complete)

![Node.js](https://img.shields.io/badge/Node.js-20.x-green) ![Express.js](https://img.shields.io/badge/Express.js-4.21-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange) ![Security](https://img.shields.io/badge/Security-A%2B-success)

A complete, enterprise-grade, production-ready Node.js, Express, and MongoDB Atlas REST API for **HireFlow AI**, supporting Authentication, User Management, Resume Management & Versioning, Document Parsing, ATS Scoring, Job Description Match, AI Suggestions, AI Career Coach, and Dashboard Analytics.

---

## 📑 Table of Contents

- [Tech Stack & Security Architecture](#-tech-stack--security-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Interactive API Documentation (Swagger)](#-interactive-api-documentation-swagger)
- [Running Automated Jest Test Suite](#-running-automated-jest-test-suite)
- [Postman Collection](#-postman-collection)
- [API Route Reference](#-api-route-reference)
- [Deployment Guide (Docker, Render, Railway, Atlas)](#-deployment-guide)
- [Production Readiness Checklist](#-production-readiness-checklist)
- [Contributing & License](#-contributing--license)

---

## 🛠️ Tech Stack & Security Architecture

- **Runtime & Core:** Node.js (v20+), Express.js (v4.21)
- **Database:** MongoDB Atlas with Mongoose ODM (Custom Indexes, Compound Indexes, Cascade Deletions)
- **Security & Hardening:**
  - `helmet` (Security Headers)
  - `express-mongo-sanitize` (NoSQL Injection Prevention)
  - `cors` (Domain Whitelisting & Secure Headers)
  - `express-rate-limit` (API, Auth & AI Endpoint Rate Limits)
  - `bcryptjs` (Password Hashing with Salt Factor 10)
  - `jsonwebtoken` (Stateless JWT Authentication with Expiration)
- **AI Engine:** Google Gemini 2.5 Flash SDK (`@google/genai`) with fallback parser
- **File & Storage:** Multer memory buffer + Cloudinary CDN
- **Parsing:** `pdf-parse` (PDF) & `mammoth` (DOCX)
- **Documentation:** `swagger-ui-express` & `swagger-jsdoc` (OpenAPI 3.0)
- **Performance:** `compression` (Gzip/Brotli response compression), Connection Pooling

---

## 📁 Project Directory Structure

```
backend/
├── src/
│   ├── config/          # Environment, DB, Cloudinary & Swagger OpenAPI setup
│   ├── constants/       # HTTP status codes & constants
│   ├── controllers/     # Auth, Resume, AI, Dashboard, Upload, Import controllers
│   ├── middleware/      # JWT Guard, Rate Limiters, Mongo Sanitize, Error Handlers
│   ├── models/          # User, Resume, ResumeVersion, ResumeUpload, ImportHistory
│   ├── routes/          # API Route Definitions (Auth, Resume, AI, Dashboard, Upload, Import)
│   ├── services/        # Gemini AI, Cloudinary, Github, Text Extraction, Email
│   ├── utils/           # ApiResponse, ApiError, Async Handler, JWT helpers
│   ├── validators/      # express-validator rules
│   ├── app.js           # Express App setup & middleware pipeline
│   └── server.js        # Server entry point & graceful shutdown listeners
├── tests/
│   └── api.test.js      # Complete Jest & Supertest API Integration Test Suite
├── docs/                # Extended Markdown Guides & Manuals
├── Dockerfile           # Production multi-stage Alpine Dockerfile
├── docker-compose.yml   # Multi-container orchestration (Backend + MongoDB)
├── HireFlow_AI_Complete_Postman_Collection.json # Complete Postman V4 Collection
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Navigate
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hireflow_db?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_hireflow_ai_2026
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run Server
```bash
# Development Mode
npm run dev

# Production Mode
npm start
```

---

## 📖 Interactive API Documentation (Swagger)

Once the server is running, open your browser to access interactive OpenAPI documentation:

- **Swagger UI:** `http://localhost:5000/docs` or `http://localhost:5000/api-docs`
- **Raw OpenAPI JSON Spec:** `http://localhost:5000/swagger.json`

---

## 🧪 Running Automated Jest Test Suite

Run the full end-to-end API integration tests using Supertest and Jest:

```bash
# Run all API test specs
npm test
```

Test coverage includes:
- Health checks & Swagger OpenAPI route validation
- Registration, Login, Profile, JWT token verification
- Resume Creation, List Pagination, Filtering, Duplicate, Archiving
- ATS Analysis, JD Match, AI Bullet Suggestions, Career Coach Chat
- Dashboard Analytics & Security authorization edge cases

---

## 📦 Postman Collection

Import `HireFlow_AI_Complete_Postman_Collection.json` into Postman.

1. Execute `2. Authentication / Register User` or `Login User` to set the `authToken` collection variable.
2. Execute requests across Resume Management, ATS Score, JD Match, AI Suggestions, Career Coach, and Dashboard Analytics.

---

## 🌐 API Route Reference

### 1. Health & Specs
- `GET /api/v1/health` - API & Database health check
- `GET /docs` - Interactive Swagger UI
- `GET /swagger.json` - Raw OpenAPI 3.0 JSON specification

### 2. Authentication & User Profile
- `POST /api/v1/auth/register` - Register user account
- `POST /api/v1/auth/login` - Authenticate user & get JWT
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update profile & skills

### 3. Resume Management & Versioning
- `POST /api/v1/resumes` - Create resume & initial version
- `GET /api/v1/resumes` - Get user resumes (pagination, search, sort, filter)
- `GET /api/v1/resumes/:id` - Fetch resume details
- `PUT /api/v1/resumes/:id` - Update resume
- `DELETE /api/v1/resumes/:id` - Delete resume & history
- `POST /api/v1/resumes/:id/duplicate` - Duplicate resume
- `POST /api/v1/resumes/:id/archive` - Archive resume
- `POST /api/v1/resumes/:id/restore` - Restore resume
- `POST /api/v1/resumes/:id/favorite` - Toggle favorite status
- `PUT /api/v1/resumes/:id/autosave` - Lightweight autosave
- `PUT /api/v1/resumes/:id/section/:sectionName` - Update section
- `POST /api/v1/resumes/:id/thumbnail` - Upload thumbnail image

### 4. AI Engine & ATS Suite
- `POST /api/v1/ai/ats-analyze` - Perform ATS keyword & score analysis
- `POST /api/v1/ai/jd-match` - Match resume against job description
- `POST /api/v1/ai/suggest` - Generate AI bullet point enhancements
- `POST /api/v1/ai/career-coach` - Interactive AI Career Coach chat

### 5. Uploads & Imports
- `POST /api/v1/upload/resume` - Upload & parse PDF/DOCX resume
- `GET /api/v1/upload/history` - List upload history
- `POST /api/v1/import/linkedin` - Import LinkedIn Profile PDF
- `POST /api/v1/import/github` - Import GitHub projects & skills

### 6. Dashboard Analytics
- `GET /api/v1/dashboard/stats` - Fetch overall stats & resume health

---

## 🐳 Deployment Guide

### Deployment with Docker & Docker Compose
```bash
# Build and run containers
docker-compose up --build -d

# Stop container stack
docker-compose down
```

### Deployment to Render / Railway
1. Push code to GitHub repository.
2. Connect repository on **Render** or **Railway**.
3. Set Environment Variables in platform settings (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLOUDINARY_*`, `NODE_ENV=production`).
4. Set Build Command: `npm install`
5. Set Start Command: `node src/server.js`

---

## ✅ Production Readiness Checklist

- [x] **Helmet Security Headers** enabled
- [x] **NoSQL Injection Sanitization** (`express-mongo-sanitize`)
- [x] **Strict Rate Limiters** on API, Auth, and AI endpoints
- [x] **CORS Policies & Whitelisting**
- [x] **Database Indexes & Compound Indexes**
- [x] **Gzip Response Compression**
- [x] **Graceful Shutdown (SIGTERM/SIGINT)**
- [x] **Containerization (Dockerfile & docker-compose)**
- [x] **OpenAPI 3.0 / Swagger Documentation**
- [x] **Supertest & Jest Automated Test Suite Pass**

---

## 📄 License
Licensed under the [MIT License](LICENSE).
