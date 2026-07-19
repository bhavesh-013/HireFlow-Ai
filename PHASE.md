# 🚀 HireFlow AI - Development Phases

> Team Size: 6 Members
>
> Development Model: Feature-Based
>
> Branch Strategy:
> - main
> - develop
> - feature/*

---

# 👨‍💼 Team Members

| Member | Branch | Responsibility |
|---------|--------|---------------|
| Member 1 | feature/landing-ui | Landing Page, Shared UI, Integration |
| Member 2 | feature/auth-dashboard | Authentication & Dashboard |
| Member 3 | feature/resume-workspace | Resume Builder, Templates, Export |
| Member 4 | feature/ai-career | AI Builder, GitHub Import, AI Assistant |
| Member 5 | feature/analysis | ATS, Health Score, JD Match |
| Member 6 | feature/backend-api | Backend APIs, Database, Gemini |

---

# Phase 1 — Project Setup

## 👨‍💼 Member 1

- Create GitHub Repository
- Setup Folder Structure
- Configure Frontend
- Configure Shared CSS Variables
- Create Common Components
- Setup Routing

Deliverables

- Navbar
- Footer
- Button
- Card
- Modal
- Input
- Layout

---

## 👨 Member 6

- Setup Express Server
- MongoDB Connection
- JWT
- Environment Variables
- Folder Structure
- Basic APIs

Deliverables

- Authentication API
- Health Check API

- (MongoDB atlas)
- user : hireflow
- pass : hireflow@0000

---

## Remaining Members

- Study Documentation
- Read PRD
- Read Architecture
- Prepare Figma

---

# Phase 2 — Landing & Authentication

## 👨‍💼 Member 1

Landing Page

- Hero
- Features
- Workflow
- Pricing
- FAQ
- Footer
- Responsive Design

---

## 👨 Member 2

Authentication

- Login
- Signup
- Forgot Password
- JWT Integration
- Profile

Depends On

Backend Authentication API

---

## 👨 Member 6

Backend

- Login API
- Signup API
- JWT
- User Schema

---

# Phase 3 — Resume Workspace

## 👨 Member 3

Build

- Resume Workspace
- Resume Editor
- Live Preview
- Templates
- Resume Sections
- Export UI

Depends On

Authentication

---

## 👨 Member 6

Backend

- Resume CRUD
- Resume Schema
- Save Resume API

---

# Phase 4 — Build with AI

## 👨 Member 4

Develop

Build with AI

- AI Chat
- Resume Upload
- GitHub Import
- LinkedIn PDF Import
- AI Recommendation UI

Depends On

Resume Workspace

---

## 👨 Member 6

Backend

- Gemini API
- Resume Parsing
- GitHub API
- Multer
- PDF Parser

---

# Phase 5 — Analysis Module

## 👨 Member 5

Develop

Analyze Resume

- ATS
- Resume Health
- JD Match
- Analytics UI

Depends On

Resume Workspace

---

## 👨 Member 6

Backend

- ATS APIs
- Analysis APIs
- JD Match APIs

---

# Phase 6 — AI Career Features

## 👨 Member 4

Develop

- Project Recommendation
- Skill Recommendation
- Certificate Recommendation
- AI Career Coach
- Cover Letter
- Learning Roadmap

Depends On

Gemini API

---

## 👨 Member 3

Resume Integration

- Add AI Suggestions
- Apply AI Improvements
- Resume Versioning

---

# Phase 7 — Dashboard

## 👨 Member 2

Dashboard

- Resume Statistics
- Recent Activity
- Saved Resumes
- User Profile
- Settings

Depends On

Resume APIs

---

## 👨 Member 5

Analytics

- Charts
- Graphs
- ATS Trends
- Resume Health Trends

---

# Phase 8 — Final Integration

## 👨‍💼 Member 1 (Lead)

Responsibilities

- Merge All Features
- Resolve Conflicts
- Responsive Testing
- UI Consistency
- Bug Fixes
- Performance
- Accessibility

---

## 👨 Member 6

Deploy

- Backend
- MongoDB Atlas
- Render

---

## 👥 All Members

- Fix Bugs
- Documentation
- Testing
- Demo Preparation

---

# Dependency Flow

Phase 1

↓

Phase 2

↓

Phase 3

↓

├── Phase 4 (AI)

└── Phase 5 (Analysis)

↓

Phase 6

↓

Phase 7

↓

Phase 8

---

# Ownership Matrix

| Feature | Owner | Backend Support |
|---------|-------|----------------|
| Landing | Member 1 | ❌ |
| Authentication | Member 2 | Member 6 |
| Dashboard | Member 2 | Member 6 |
| Resume Workspace | Member 3 | Member 6 |
| Templates | Member 3 | Member 6 |
| AI Builder | Member 4 | Member 6 |
| GitHub Import | Member 4 | Member 6 |
| AI Assistant | Member 4 | Member 6 |
| ATS | Member 5 | Member 6 |
| Resume Health | Member 5 | Member 6 |
| JD Match | Member 5 | Member 6 |
| Analytics | Member 5 | Member 6 |
| Backend APIs | Member 6 | Owner |
| Database | Member 6 | Owner |
| Deployment | Member 6 | Owner |
| Final Integration | Member 1 | All Members |

---

# AI Usage Responsibility

| Member | Allowed AI Tasks |
|---------|-----------------|
| Member 1 | UI Components, Landing Page, Responsive Design |
| Member 2 | Authentication UI, Dashboard UI |
| Member 3 | Resume Components, Template UI |
| Member 4 | AI Chat UI, GitHub Integration UI, Career Features |
| Member 5 | ATS UI, Analytics UI, Charts |
| Member 6 | APIs, Controllers, Database, Gemini Integration |

❌ No member may generate another member's module with AI without discussion.

---

# Daily Workflow

Morning

↓

Pull `develop`

↓

Work on Feature Branch

↓

Test Feature

↓

Commit

↓

Push Feature Branch

↓

Create Pull Request

↓

Code Review

↓

Merge into `develop`

↓

Nightly Integration
