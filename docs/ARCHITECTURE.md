# 📁 Project Structure

```text
HireFlow-AI/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── RULES.md
│   ├── PHASES.md
│   ├── API.md
│   ├── DATABASE.md
│   └── CONTRIBUTING.md
│
frontend/
│
├── index.html                    # Entry point (redirect/check auth)
│
├── assets/
│   ├── css/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── typography.css
│   │   ├── utilities.css
│   │   └── animations.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── router.js
│   │   └── storage.js
│   │
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── charts/
│   ├── resume/
│   └── ai/
│
├── pages/
│
│   ├── landing/
│   │   ├── index.html
│   │   ├── landing.css
│   │   └── landing.js
│   │
│   ├── auth/
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── forgot-password.html
│   │   ├── verify-email.html
│   │   ├── auth.css
│   │   └── auth.js
│   │
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── dashboard.css
│   │   └── dashboard.js
│   │
│   ├── build-ai/
│   │   ├── overview/
│   │   │   ├── overview.html
│   │   │   ├── overview.css
│   │   │   └── overview.js
│   │   │
│   │   ├── editor/
│   │   ├── tailor-resume/
│   │   ├── templates/
│   │   ├── upload/
│   │   ├── github-import/
│   │   └── linkedin-import/
│   │
│   ├── analysis/
│   │   ├── ats/
│   │   ├── ai-suggestions/
│   │   ├── jd-match/
│   │   └── reports/
│   │
│   ├── ai-assistant/
│   │   ├── assistant.html
│   │   ├── assistant.css
│   │   └── assistant.js
│   │
│   ├── profile/
│   │   ├── profile.html
│   │   ├── security.html
│   │   ├── notifications.html
│   │   ├── preferences.html
│   │   └── profile.css
│   │
│   └── settings/
│       ├── settings.html
│       ├── settings.css
│       └── settings.js
│
├── services/
│   ├── api.js
│   ├── auth.js
│   ├── resume.js
│   ├── analysis.js
│   ├── ai.js
│   └── github.js
│
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   ├── validators.js
│   └── formatter.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```
