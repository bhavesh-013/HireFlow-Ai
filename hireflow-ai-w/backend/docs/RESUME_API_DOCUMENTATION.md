# HireFlow AI - Phase 2 Resume Management API Documentation

Welcome to the **HireFlow AI Phase 2 API Reference**. This document details all endpoints for managing resumes, granular section updates, version history snapshots, dashboard metrics, and template references.

---

## Table of Contents
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Standard Response Structure](#standard-response-structure)
- [Resume Endpoints](#resume-endpoints)
  - [1. Create Resume](#1-create-resume)
  - [2. Get User Resumes](#2-get-user-resumes)
  - [3. Get Resume by ID](#3-get-resume-by-id)
  - [4. Update Resume](#4-update-resume)
  - [5. Delete Resume](#5-delete-resume)
  - [6. Duplicate Resume](#6-duplicate-resume)
  - [7. Toggle Favorite Resume](#7-toggle-favorite-resume)
  - [8. Archive Resume](#8-archive-resume)
  - [9. Restore Archived Resume](#9-restore-archived-resume)
  - [10. Autosave Resume](#10-autosave-resume)
  - [11. Update Granular Section](#11-update-granular-section)
  - [12. Upload Resume Thumbnail](#12-upload-resume-thumbnail)
- [Version History Endpoints](#version-history-endpoints)
  - [13. Create Version Snapshot](#13-create-version-snapshot)
  - [14. Get Version History](#14-get-version-history)
  - [15. Restore Version Snapshot](#15-restore-version-snapshot)
  - [16. Delete Version Snapshot](#16-delete-version-snapshot)
- [Dashboard & Templates Endpoints](#dashboard--templates-endpoints)
  - [17. Get Dashboard Stats](#17-get-dashboard-stats)
  - [18. Get Recent Resumes](#18-get-recent-resumes)
  - [19. List Templates](#19-list-templates)
  - [20. Switch Resume Template](#20-switch-resume-template)

---

## Authentication
All protected routes require a valid JWT bearer token provided in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## Base URL
```
http://localhost:5000/api/v1
```
*(Also aliased at `http://localhost:5000/api`)*

---

## Standard Response Structure

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description message",
  "errors": null,
  "stack": "Stack trace (development mode only)"
}
```

---

## Resume Endpoints

### 1. Create Resume
- **Endpoint:** `POST /api/v1/resumes`
- **Access:** Private
- **Request Body:**
```json
{
  "title": "Senior Full Stack Developer Resume",
  "template": "modern",
  "theme": {
    "primaryColor": "#0B192C",
    "secondaryColor": "#1E3E62",
    "accentColor": "#3B82F6",
    "font": "Inter",
    "fontSize": "medium",
    "layoutSpacing": "normal"
  },
  "resumeData": {
    "personalInfo": {
      "firstName": "Sarah",
      "lastName": "Jenkins",
      "email": "sarah@example.com",
      "phone": "+1 (555) 019-2834",
      "jobTitle": "Senior Software Architect"
    },
    "summary": "Full stack engineer with 7+ years of experience...",
    "skills": [
      { "id": "s1", "category": "Frontend", "name": "React.js", "level": "Expert" }
    ]
  }
}
```

### 2. Get User Resumes
- **Endpoint:** `GET /api/v1/resumes`
- **Access:** Private
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (searches title, job title, names)
  - `favorite` (`true` | `false`)
  - `archived` (`true` | `false`, default: `false`)
  - `sortBy` (`lastEdited`, `createdAt`, `title`, `atsScore`, default: `lastEdited`)
  - `sortOrder` (`asc` | `desc`, default: `desc`)

### 3. Get Resume by ID
- **Endpoint:** `GET /api/v1/resumes/:id`
- **Access:** Private

### 4. Update Resume
- **Endpoint:** `PUT /api/v1/resumes/:id`
- **Access:** Private
- **Request Body:**
```json
{
  "title": "Updated Resume Title",
  "visibility": "private",
  "status": "published"
}
```

### 5. Delete Resume
- **Endpoint:** `DELETE /api/v1/resumes/:id`
- **Access:** Private

### 6. Duplicate Resume
- **Endpoint:** `POST /api/v1/resumes/:id/duplicate`
- **Access:** Private

### 7. Toggle Favorite Resume
- **Endpoint:** `POST /api/v1/resumes/:id/favorite`
- **Access:** Private

### 8. Archive Resume
- **Endpoint:** `POST /api/v1/resumes/:id/archive`
- **Access:** Private

### 9. Restore Archived Resume
- **Endpoint:** `POST /api/v1/resumes/:id/restore`
- **Access:** Private

### 10. Autosave Resume
- **Endpoint:** `PUT /api/v1/resumes/:id/autosave`
- **Access:** Private

### 11. Update Granular Section
- **Endpoint:** `PUT /api/v1/resumes/:id/section/:sectionName`
- **Access:** Private
- **Allowed Section Names:** `personalInfo`, `summary`, `experience`, `education`, `projects`, `skills`, `certifications`, `achievements`, `languages`, `links`, `customSections`

### 12. Upload Resume Thumbnail
- **Endpoint:** `POST /api/v1/resumes/:id/thumbnail`
- **Access:** Private
- **Content-Type:** `multipart/form-data`
- **Body:** `thumbnail` (file field, max 5MB, JPEG/PNG/WEBP)

---

## Version History Endpoints

### 13. Create Version Snapshot
- **Endpoint:** `POST /api/v1/resumes/:id/version`
- **Access:** Private
- **Request Body:**
```json
{
  "name": "Pre-Interview Revision",
  "notes": "Updated experience section before final Google round."
}
```

### 14. Get Version History
- **Endpoint:** `GET /api/v1/resumes/:id/history`
- **Access:** Private

### 15. Restore Version Snapshot
- **Endpoint:** `POST /api/v1/resumes/:id/version/:versionId/restore`
- **Access:** Private

### 16. Delete Version Snapshot
- **Endpoint:** `DELETE /api/v1/resumes/:id/version/:versionId`
- **Access:** Private

---

## Dashboard & Templates Endpoints

### 17. Get Dashboard Stats
- **Endpoint:** `GET /api/v1/dashboard/stats`
- **Access:** Private
- **Response Data:**
```json
{
  "totalResumes": 5,
  "favoriteResumes": 2,
  "archivedResumes": 1,
  "averageAtsScore": 88,
  "averageHealthScore": 92,
  "lastEdited": "2026-07-30T09:30:00.000Z"
}
```

### 18. Get Recent Resumes
- **Endpoint:** `GET /api/v1/dashboard/recent?limit=5`
- **Access:** Private

### 19. List Templates
- **Endpoint:** `GET /api/v1/templates`
- **Access:** Public

### 20. Switch Resume Template
- **Endpoint:** `PUT /api/v1/resumes/:id/template`
- **Access:** Private
```json
{
  "template": "executive",
  "theme": {
    "primaryColor": "#0F172A",
    "font": "Playfair Display"
  }
}
```
