# HireFlow

> AI-powered resume builder, ATS analyzer, and career preparation platform.

HireFlow is a resume-focused web application designed to help users create, analyze, improve, and tailor resumes for job applications. The platform combines resume parsing, ATS analysis, job-description matching, AI-powered suggestions, resume editing, and career guidance in one workflow.

**Project Status:** Active development. The **ATS Analysis** module is currently the main area of development and testing.

---

## Features

### 1. Resume Upload & Parsing
Users can upload an existing resume and extract structured information including:

- Name and contact information
- Professional summary
- Skills
- Education
- Work experience
- Projects
- Certifications
- Achievements
- GitHub and LinkedIn links

**Workflow:**

```text
Resume File
    ↓
File Parser
    ↓
Extracted Text
    ↓
Structured Resume Data
    ↓
ATS / Editor / AI Features
```

---

### 2. ATS Resume Analysis

**Current primary development focus.**

HireFlow evaluates resumes using eight ATS criteria:

| Criterion | Purpose |
|---|---|
| Contact | Contact and professional links |
| Structure | Resume organization and section structure |
| Experience | Professional experience and bullet quality |
| Skills | Technical and relevant skills |
| Projects | Project information and descriptions |
| Education | Education information |
| Formatting | ATS-readable formatting |
| Content Quality | Clarity, grammar, wording, and content quality |

### ATS Architecture

Gemini is used for semantic analysis, while the final weighted score is calculated by the backend.

```text
Resume
   ↓
Gemini semantic analysis
   ↓
8 category evaluations
   ↓
Backend validation
   ↓
Weighted scoring
   ↓
Final ATS Score / 100
```

### Standard ATS Weights

```text
Contact          10%
Structure        10%
Experience       20%
Skills           15%
Projects         15%
Education        10%
Formatting       10%
Content Quality  10%
                 ----
                 100%
```

The frontend does not independently generate the final ATS score.

### ATS Output

The analysis can provide:

- Overall ATS score
- Category-level scores
- Resume issues
- Priority fixes
- Missing keywords
- Matched keywords
- Job-description matching
- Resume quality feedback
- Improvement suggestions

> HireFlow does not guarantee that a resume will pass a particular ATS. ATS behavior varies between employers and configurations.

---

### 3. Resume Builder

Users can create and edit structured resumes through sections such as:

- Personal information
- Summary
- Skills
- Experience
- Projects
- Education
- Certifications
- Achievements

The builder is designed to maintain consistent structure while allowing users to customize their content.

---

### 4. Fresher & Experienced Resume Support

HireFlow supports different strategies for different candidate profiles.

#### Fresher

The resume can emphasize:

- Education
- Projects
- Technical skills
- Certifications
- Achievements
- Relevant coursework

#### Experienced

The resume can emphasize:

- Professional experience
- Responsibilities
- Achievements
- Measurable impact
- Relevant skills
- Projects

The objective is to avoid evaluating a fresher and experienced candidate in exactly the same way.

---

### 5. AI Resume Improvement

The AI can help with:

- Grammar correction
- Spelling correction
- Sentence clarity
- Stronger action verbs
- Concise bullet points
- Professional wording
- Content structure
- Keyword placement
- Resume readability

Example:

```text
Before:
Worked on website using React.

After:
Developed a responsive web interface using React.
```

AI improvements must remain grounded in information already provided by the candidate.

---

### 6. Job Description Matching

Users can provide a target job description.

HireFlow can identify:

- Relevant keywords
- Missing keywords
- Matching skills
- Missing skills
- Job-description alignment

Example:

```text
Job Description
React
TypeScript
Docker
AWS

        ↓

Resume
React
TypeScript

        ↓

Potentially Missing
Docker
AWS
```

A missing skill should only be added when the candidate genuinely possesses it.

---

### 7. AI Career Coach

The Career Coach is focused on:

- Resume questions
- Resume improvement
- Interview preparation
- Career preparation related to resumes and interviews

It is intentionally restricted instead of acting as a general-purpose chatbot.

Example:

```text
User:
How can I improve my resume summary?

Career Coach:
Provides resume-focused guidance.
```

For unrelated questions, the assistant should reject the request and remain focused on resume/interview topics.

---

### 8. GitHub Import

GitHub integration is intended to reduce manual resume entry.

```text
GitHub Profile
      ↓
Repository Analysis
      ↓
Extract Projects & Technologies
      ↓
Resume Builder
```

The planned extraction includes:

- Repository/project names
- Technologies
- Relevant project descriptions
- Public project information

**Status:** In development and requires additional testing.

---

### 9. Resume Templates

HireFlow includes a resume-template workflow intended to provide:

- ATS-friendly layouts
- Professional formatting
- Consistent spacing
- Clear section hierarchy
- One-page layouts where appropriate
- Different layouts for candidate types

**Status:** Template refinement and testing are still in progress.

---

### 10. Authentication & Navigation

The application supports authenticated workflows and navigation between major features:

```text
Login
  ↓
Dashboard
  ├── Resume Builder
  ├── ATS Analysis
  ├── Job Match
  ├── Career Coach
  ├── Templates
  └── Profile
```

---

# Technology Stack

## Frontend

- **React** — component-based UI
- **TypeScript** — type safety and application logic
- **Tailwind CSS** — responsive styling
- **Lucide React** — UI icons

## Backend

- **Supabase**
  - Authentication
  - Database
  - Edge Functions
  - Backend services

## AI

- **Google Gemini**
  - Resume analysis
  - Content-quality evaluation
  - Resume improvement
  - Job-description understanding
  - Keyword extraction
  - Career assistance

## Resume Processing

The application converts uploaded files into structured resume data:

```text
PDF / DOCX / TXT / RTF
          ↓
      File Parser
          ↓
    Extracted Text
          ↓
 ParsedResumeData
```

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │ TypeScript +        │
                    │ Tailwind CSS        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Supabase        │
                    │ Authentication      │
                    │ Database            │
                    │ Edge Functions      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   analyze-resume    │
                    │    Edge Function    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Gemini        │
                    │    AI Analysis      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Deterministic ATS   │
                    │ Score Calculation   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ ATS Report          │
                    │ Score + Issues      │
                    │ + Keywords          │
                    └─────────────────────┘
```

---

# Current Working Features

The current project includes or is actively implementing:

- [x] Resume upload workflow
- [x] Resume parsing
- [x] Structured resume data
- [x] Resume preview
- [x] Resume editing
- [x] Supabase integration
- [x] Gemini AI integration
- [x] ATS analysis architecture
- [x] Eight ATS evaluation criteria
- [x] Backend weighted ATS scoring
- [x] Resume issue detection
- [x] Missing keyword detection
- [x] Job-description analysis workflow
- [x] AI resume improvement workflow
- [x] Resume validation
- [x] Section-order recommendations
- [x] Authentication/navigation foundation

> Exact feature readiness can vary by the current development branch.

---

# Currently in Development

## ATS Analysis — Main Focus

Current work includes:

- Improving ATS scoring accuracy
- Testing different resume formats
- Improving keyword matching
- Reducing inconsistent AI responses
- Validating Gemini output
- Improving fresher/experienced scoring
- Testing against different job descriptions
- Improving issue prioritization
- Making score changes reflect actual resume changes
- Aligning `ATSAnalysisPage.tsx` with the Supabase `analyze-resume` response

## Other Pending Work

### GitHub Import
Improve extraction of:

- Projects
- Technologies
- Repository information
- Useful resume content

### Resume Templates
Improve:

- One-page consistency
- ATS readability
- Visual hierarchy
- Fresher layouts
- Experienced layouts

### AI Career Coach
Improve:

- Resume-specific answers
- Interview-specific answers
- Context handling
- Unrelated-query rejection
- Career guidance quality

### Production Testing
Test:

- Different PDF layouts
- DOCX files
- Long resumes
- Short resumes
- Fresher resumes
- Experienced resumes
- Missing sections
- Different job descriptions
- Invalid files
- AI failures and edge cases

---

# AI Safety & No-Fabrication Rules

HireFlow's AI should never invent:

- Companies
- Job titles
- Projects
- Technologies
- Certifications
- Dates
- Achievements
- Metrics
- Percentages
- Salary
- Revenue
- User counts
- Performance statistics

Example:

```text
Resume:
Developed a React application.

Allowed:
Improve wording and grammar.

Not allowed:
Developed a React application used by 50,000 users.
```

unless `50,000 users` actually exists in the user's resume.

---

# Why Backend Scoring?

A major design decision is to separate AI analysis from numerical score calculation.

Instead of:

```text
Resume → Gemini → "ATS Score = 92"
```

HireFlow uses:

```text
Resume
   ↓
Gemini
   ↓
8 category evaluations
   ↓
Backend validation
   ↓
Predefined weights
   ↓
Final ATS score
```

Benefits:

- More predictable scoring
- Easier debugging
- Easier testing
- More transparent scoring
- Less dependence on arbitrary AI-generated numbers

---

# Project Goals

The long-term workflow is:

```text
Create Resume
      ↓
Import Existing Resume
      ↓
Analyze Resume
      ↓
Find Problems
      ↓
Match Job Description
      ↓
Improve Resume
      ↓
Select Template
      ↓
Export Resume
      ↓
Prepare for Interview
```

HireFlow aims to combine resume creation, analysis, optimization, and interview preparation in one platform.

---

# Future Improvements

Potential future improvements include:

- More ATS-friendly templates
- Better PDF/DOCX parsing
- Advanced GitHub import
- LinkedIn profile import
- Improved job-description matching
- Better keyword normalization
- Resume version history
- Saved job-specific resumes
- Resume comparison
- Advanced interview preparation
- More extensive ATS testing
- Production monitoring and analytics

---

# Getting Started

## Prerequisites

- Node.js
- npm
- Supabase project
- Gemini API configuration

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

---

# Environment Variables

Typical frontend configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Server-side secrets such as the Supabase service-role key must **never** be exposed in frontend code.

Gemini credentials should also remain on the server/Edge Function side.

---

# Project Status

**Status: Active Development**

### Main Focus

> **ATS Analysis**

The ATS module is currently being refined to provide a more reliable, transparent, and grounded resume evaluation system.

### Development Priority

```text
ATS Accuracy
     ↓
Backend / Frontend Integration
     ↓
JD Matching
     ↓
Resume Improvement
     ↓
Templates
     ↓
GitHub Import
     ↓
Production Testing
```

---

# Disclaimer

HireFlow's ATS score is an **estimated compatibility score**, not a guarantee of passing a particular applicant tracking system or receiving an interview.

Different companies may use different ATS configurations, parsing methods, ranking systems, and hiring criteria.

The purpose of HireFlow is to help users identify common resume issues and improve their resumes using structured analysis and AI-assisted suggestions.

---

## Built With

**React · TypeScript · Tailwind CSS · Supabase · Google Gemini · Lucide React**
