# HireFlow AI

> An AI-powered resume and career platform designed to help users build, analyze, tailor, and improve their resumes for real-world job applications.

## 🚀 About the Project

**HireFlow AI** is a web application focused on making the job-search and resume-building process easier and more effective.

The platform combines resume creation, professional templates, ATS analysis, job-description matching, AI-powered suggestions, and career assistance in one workspace.

The project is currently under active development. The core UI, resume workflow, templates, ATS functionality, and application structure are being developed while the **AI API integration and resume formatting/export experience are currently being worked on**.

## ✨ Features

### 📄 Resume Builder
- Create and edit resumes in a structured workspace.
- Organize resume information into different sections.
- Reorder resume sections.
- Validate resume content.
- Preview changes using reusable resume components.

### 🎨 Professional Resume Templates
Multiple resume styles are available, including:
- Minimal
- ATS Classic
- Technical
- Modern Professional
- Executive

Templates are designed to provide different visual styles while keeping resume content structured and readable.

### 🤖 AI Career Assistant
- AI-powered career assistance.
- AI writing and improvement suggestions.
- Resume content optimization.
- Skill optimization.
- Career-focused guidance.

**Status:** AI API integration is currently in progress.

### 📊 ATS Resume Analysis
- Analyze resumes against ATS-oriented rules.
- Identify potential resume issues.
- Keyword analysis.
- Skill extraction.
- Resume validation.
- ATS-focused improvement suggestions.

### 🎯 Job Description Matching
- Analyze a job description.
- Compare job requirements with resume information.
- Identify relevant keywords and skills.
- Help tailor resume content toward a specific role.

### 🔗 GitHub Import
- Import project information from GitHub.
- Extract project-related information for use in a resume.
- Reduce the manual effort required to add technical projects.

### 📥 Resume Import & Export
- Resume file parsing support.
- PDF and document processing.
- Resume preview and rendering.
- Resume export functionality.

**Status:** Resume formatting and export quality are currently being refined.

### 🔐 Authentication & Profile
- User login and signup.
- Password recovery/reset flow.
- Profile management.
- Application settings.
- Protected application workspace.

### 🗂️ Resume Management
- Resume data persistence.
- Resume versions/history.
- Template favorites.
- Dashboard and resume workflow management.

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Motion

### Backend / Services
- Supabase
- AI API integration *(in progress)*

### File & Resume Processing
- PDF.js
- Mammoth
- DOCX generation

### Development Tools
- Git & GitHub
- npm
- Vite

## 📁 Project Structure

```text
src/
├── components/
│   ├── app/
│   ├── templates/
│   └── ...
├── data/
├── hooks/
├── lib/
├── pages/
├── services/
├── utils/
├── App.tsx
├── index.css
└── main.tsx
```

The project follows a component-based React architecture with separate services for ATS analysis, AI functionality, GitHub importing, resume management, exporting, authentication, and other application logic.

## 🔄 Current Development

HireFlow AI is actively being developed.

### Currently working on
- AI API integration
- AI-powered resume improvements
- Resume formatting
- Resume export quality
- Finalizing AI-assisted workflows
- Improving consistency across resume templates

### Planned Improvements
- More advanced AI resume tailoring
- Better job-description matching
- Improved ATS recommendations
- More resume templates
- Enhanced formatting and export controls
- Additional career assistance features

## ⚙️ Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm
- A Supabase project for the configured backend services
- Required AI API credentials

### Installation

Clone the repository:

```bash
git clone https://github.com/bhavesh-013/HireFlow-Ai.git
cd HireFlow-Ai
```

Install dependencies:

```bash
npm install
```

Create your environment file and add the required API credentials.

Then start the development server:

```bash
npm run dev
```

The application will be available at the local Vite development URL shown in your terminal.

### Build for Production

```bash
npm run build
```

### Type Check

```bash
npm run lint
```

## 📌 Project Status

**🚧 In Development**

The main application experience and core resume functionality are being built. AI API integration and resume formatting are currently active development areas.

## 👨‍💻 Contributors

**Bhavesh Kumawat**

Built as a project focused on exploring modern frontend development, AI-powered applications, resume systems, and career technology.

## 📄 License

This project is currently intended for educational and development purposes.
