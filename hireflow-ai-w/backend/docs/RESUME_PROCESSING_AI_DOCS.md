# HireFlow AI - Resume Processing & AI Integration API Specification (Phase 3)

This document provides complete documentation for Phase 3: Resume Upload, PDF/DOCX Text Extraction, Gemini AI Resume Parsing, LinkedIn Profile Import, GitHub Integration, Resume Quality Validation, and Upload History.

---

## 📑 Table of Contents

1. [Overview & Tech Stack](#overview--tech-stack)
2. [Upload & Parsing Flow](#upload--parsing-flow)
3. [API Endpoints](#api-endpoints)
   - [Upload & Parse Resume](#1-upload--parse-resume)
   - [Get Upload & Import History](#2-get-upload--import-history)
   - [Delete Upload Record](#3-delete-upload-record)
   - [Import LinkedIn Profile PDF](#4-import-linkedin-profile-pdf)
   - [Import GitHub Profile & Repositories](#5-import-github-profile--repositories)
4. [Resume Quality Validation Rules](#resume-quality-validation-rules)
5. [Error Handling & Edge Cases](#error-handling--edge-cases)

---

## 🛠️ Overview & Tech Stack

- **File Parsing:** `pdf-parse` (PDF extraction) & `mammoth` (DOCX extraction)
- **AI Processing:** `@google/genai` (Google Gemini 2.5 Flash / 1.5 Flash)
- **Cloud Storage:** Cloudinary (`resource_type: raw` for document retention)
- **External APIs:** GitHub REST API v3
- **Validation Engine:** Built-in completeness & health score validator (Missing Email, Missing Skills, Missing Summary, Empty Sections, Weak Resume)

---

## 🔄 Upload & Parsing Flow

1. **User Uploads File:** Send multipart `file` (PDF/DOCX, max 10MB).
2. **Cloud Storage:** Upload file buffer to Cloudinary (`hireflow_resumes/documents`).
3. **Text Extraction:** Extract raw document text in memory without writing temporary files to disk.
4. **AI Resume Parsing:** Send extracted text to Gemini AI model (`gemini-2.5-flash`) with structured JSON schema prompt. Fallback regex parser ensures continuous operation if AI API is unconfigured.
5. **Quality & Completeness Check:** Validate parsed fields for completeness (Email, Phone, Summary, Skills, Work Experience, Education). Calculate dynamic `healthScore` (0-100).
6. **MongoDB Storage:**
   - Create `Resume` document with parsed data and validation results.
   - Create `ResumeVersion` (Version 1 snapshot).
   - Create `ResumeUpload` metadata record.
   - Record in `ImportHistory`.
7. **Response:** Return newly created `Resume`, `uploadRecord`, and `validation` results.

---

## 📡 API Endpoints

### 1. Upload & Parse Resume
- **Method:** `POST`
- **Endpoint:** `/api/v1/upload/resume` (or `/api/upload/resume`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Content-Type:** `multipart/form-data`
- **Form Data Parameters:**
  - `file` (or `resume`): Resume document file (.pdf or .docx, max 10MB)

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Resume file uploaded and parsed successfully",
  "data": {
    "resume": {
      "_id": "67993a4b0021c32",
      "owner": "6799321f0010a",
      "title": "Alex Developer's Resume",
      "template": "modern",
      "healthScore": 90,
      "atsScore": 81,
      "validation": {
        "isValid": true,
        "healthScore": 90,
        "issues": [
          {
            "type": "warning",
            "field": "personalInfo.phone",
            "message": "Missing Phone Number",
            "recommendation": "Include a contact phone number for interview scheduling."
          }
        ]
      },
      "resumeData": {
        "personalInfo": {
          "firstName": "Alex",
          "lastName": "Developer",
          "email": "alex@example.com",
          "phone": "",
          "location": "San Francisco, CA",
          "jobTitle": "Full Stack Software Engineer",
          "linkedin": "https://linkedin.com/in/alexdev",
          "github": "https://github.com/alexdev"
        },
        "summary": "Passionate Full Stack Engineer with 4+ years building cloud solutions...",
        "experience": [ ... ],
        "education": [ ... ],
        "skills": [ ... ]
      }
    },
    "uploadRecord": {
      "_id": "67993a4b0021c35",
      "originalName": "Alex_Resume_2026.pdf",
      "fileType": "pdf",
      "fileSize": 245120,
      "status": "parsed"
    }
  }
}
```

---

### 2. Get Upload & Import History
- **Method:** `GET`
- **Endpoint:** `/api/v1/upload/history?page=1&limit=10`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Upload and import history fetched successfully",
  "data": {
    "uploads": [
      {
        "_id": "67993a4b0021c35",
        "originalName": "Alex_Resume_2026.pdf",
        "fileType": "pdf",
        "fileSize": 245120,
        "status": "parsed",
        "createdAt": "2026-07-30T10:00:00.000Z"
      }
    ],
    "imports": [
      {
        "_id": "67993a4b0021c38",
        "importType": "file_upload",
        "status": "success",
        "itemsImportedCount": 14,
        "createdAt": "2026-07-30T10:00:00.000Z"
      }
    ]
  },
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3. Delete Upload Record
- **Method:** `DELETE`
- **Endpoint:** `/api/v1/upload/:id`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Upload record and Cloudinary document deleted successfully"
}
```

---

### 4. Import LinkedIn Profile PDF
- **Method:** `POST`
- **Endpoint:** `/api/v1/import/linkedin`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Content-Type:** `multipart/form-data`
- **Form Data Parameters:**
  - `file` (or `linkedinPdf`): Exported LinkedIn Profile PDF file

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "LinkedIn profile imported and converted into Resume successfully",
  "data": {
    "resume": { ... },
    "importHistory": { ... }
  }
}
```

---

### 5. Import GitHub Profile & Repositories
- **Method:** `POST`
- **Endpoint:** `/api/v1/import/github`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Content-Type:** `application/json`
- **Body Request:**
```json
{
  "username": "octocat",
  "resumeId": "67993a4b0021c32" // Optional: merge into existing resume
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "GitHub portfolio imported successfully into Resume",
  "data": {
    "resume": { ... },
    "importHistory": { ... },
    "githubData": {
      "profile": {
        "username": "octocat",
        "firstName": "Mona",
        "lastName": "Lisa",
        "github": "https://github.com/octocat"
      },
      "repoCount": 8,
      "projects": [ ... ],
      "skills": [ ... ]
    }
  }
}
```

---

## 🔍 Resume Quality Validation Rules

The built-in validation engine assesses resumes across 6 key metrics:

| Check | Severity Level | Deduction | Remediation Recommendation |
| :--- | :--- | :--- | :--- |
| **Missing Email** | `error` | -20 pts | Add a valid professional email address |
| **Invalid Email Format** | `warning` | -10 pts | Ensure email matches name@domain.com |
| **Missing Phone** | `warning` | -5 pts | Include contact phone number for interviews |
| **Missing Location** | `warning` | -5 pts | Add city and country/state |
| **Missing Summary** | `warning` | -15 pts | Write 2-4 sentence summary |
| **Short Summary (<40 chars)**| `warning` | -8 pts | Expand summary to 40-100 words |
| **Missing Skills (0 skills)**| `error` | -20 pts | Add at least 5 key skills |
| **Low Skill Count (<4)** | `warning` | -10 pts | Include 6-10 skills for higher ATS match |
| **Empty Experience & Edu**| `error` | -25 pts | At least 1 experience or education required |
| **Experience w/o Bullets**| `warning` | -5 pts | Add 2-4 bullet points per work experience |

---

## 🛡️ Error Handling & Edge Cases

| Case | Status Code | Error Message / Behavior |
| :--- | :--- | :--- |
| **File > 10MB** | `400 Bad Request` | `File size exceeds the 10MB limit.` |
| **Unsupported Format** | `400 Bad Request` | `Invalid file type! Only PDF (.pdf) and DOCX (.docx) documents are allowed.` |
| **Corrupted PDF** | `400 Bad Request` | `Corrupted or invalid PDF file: [details]` |
| **Image-Only PDF** | `400 Bad Request` | `Unable to extract text from PDF file. File may be image-only or scanned.` |
| **GitHub User Not Found** | `404 Not Found` | `GitHub user or repositories not found. Please verify the username.` |
| **Missing Gemini API Key** | `201 Created` | Automatically falls back to Regex-based document parser without crashing. |
