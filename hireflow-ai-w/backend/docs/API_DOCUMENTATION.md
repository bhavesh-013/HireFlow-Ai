# HireFlow AI - Phase 1 API Documentation

Welcome to the HireFlow AI Phase 1 Backend API documentation. This document provides full specification for the authentication and user management endpoints.

---

## Base URL

- **Development:** `http://localhost:5000/api/v1`
- **Production:** `https://your-domain.com/api/v1`

---

## Authentication Mechanism

All protected endpoints require a valid JWT token sent via either:
1. **HTTP Authorization Header:** `Authorization: Bearer <your_jwt_token>`
2. **HTTP Cookie:** `token=<your_jwt_token>` (httpOnly cookie set automatically upon login/register)

---

## Standard Response Format

### Success Response Structure
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response Structure
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description message",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

## API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Verify backend service & MongoDB connection status |
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Authenticate existing user credentials |
| `POST` | `/auth/google` | Public | Authenticate or sign up with Google ID Token |
| `POST` | `/auth/forgot-password` | Public | Send password reset token email |
| `POST` | `/auth/reset-password` | Public | Reset password using valid reset token |
| `POST` | `/auth/logout` | Private | Logout user session |
| `GET` | `/auth/me` | Private | Get profile details of current user |
| `PUT` | `/auth/profile` | Private | Update user profile information |

---

## Detailed Endpoint Specifications

### 1. Health Check
- **Endpoint:** `GET /health`
- **Access:** Public
- **Response Example (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server health status check passed",
  "data": {
    "status": "healthy",
    "uptime": "142s",
    "timestamp": "2026-07-30T09:15:00.000Z",
    "service": "HireFlow AI Phase 1 Backend API",
    "environment": "development",
    "database": {
      "status": "Connected",
      "isConnected": true
    }
  }
}
```

---

### 2. User Registration
- **Endpoint:** `POST /auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Alex Mercer",
  "email": "alex.mercer@example.com",
  "password": "Password123!"
}
```
- **Response Example (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66a8b123c456d7890e1f2a3b",
      "name": "Alex Mercer",
      "email": "alex.mercer@example.com",
      "authProvider": "local",
      "role": "user",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb...",
      "skills": [],
      "createdAt": "2026-07-30T09:15:00.000Z"
    }
  }
}
```

---

### 3. User Login
- **Endpoint:** `POST /auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "alex.mercer@example.com",
  "password": "Password123!"
}
```
- **Response Example (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66a8b123c456d7890e1f2a3b",
      "name": "Alex Mercer",
      "email": "alex.mercer@example.com"
    }
  }
}
```

---

### 4. Google OAuth Login
- **Endpoint:** `POST /auth/google`
- **Access:** Public
- **Request Body:**
```json
{
  "idToken": "google_oauth_id_token_from_client"
}
```

---

### 5. Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "alex.mercer@example.com"
}
```
- **Response Example (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent successfully"
}
```

---

### 6. Reset Password
- **Endpoint:** `POST /auth/reset-password`
- **Access:** Public
- **Request Body:**
```json
{
  "token": "f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
  "password": "NewSecurePassword123!"
}
```

---

### 7. Get Current User (`/me`)
- **Endpoint:** `GET /auth/me`
- **Access:** Private (Bearer Token required)
- **Header:** `Authorization: Bearer <token>`
- **Response Example (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current user profile fetched successfully",
  "data": {
    "_id": "66a8b123c456d7890e1f2a3b",
    "name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "headline": "Senior Full Stack Engineer",
    "bio": "Building AI-powered resume analyzers.",
    "skills": ["React", "Node.js", "Express", "MongoDB"]
  }
}
```

---

### 8. Update Profile
- **Endpoint:** `PUT /auth/profile`
- **Access:** Private (Bearer Token required)
- **Request Body:**
```json
{
  "name": "Alex Mercer",
  "headline": "Lead AI Engineer",
  "bio": "Passionate about career automation tools.",
  "skills": ["React", "TypeScript", "Node.js", "MongoDB", "Express"]
}
```

---

### 9. Logout
- **Endpoint:** `POST /auth/logout`
- **Access:** Private
- **Response Example (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```
