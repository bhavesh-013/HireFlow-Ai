# 📜 HireFlow AI - Development Rules

> These rules are mandatory for every team member.
> The goal is to keep the project consistent even when everyone uses AI tools like ChatGPT, Gemini, Claude, GitHub Copilot, or Cursor.

---

# 1. General Rules

✅ Understand AI-generated code before committing.

❌ Never blindly copy and paste AI-generated code.

Every team member is responsible for the code they push.

---

# 2. Before Asking AI

Before asking AI to generate code:

- Read existing project code.
- Check if a similar component already exists.
- Check folder structure.
- Follow project naming conventions.

Never ask AI to generate an entire project structure.

Only generate the feature you are assigned.

---

# 3. Never Let AI Decide Project Structure

The project architecture is already finalized.

Never change:

- Folder names
- File names
- Routing structure
- API structure
- Database structure

without team approval.

---

# 4. Reuse Components

Before creating:

- Button
- Modal
- Card
- Input
- Navbar
- Sidebar
- Dialog
- Chart

Check if one already exists.

Never create duplicate components.

---

# 5. Naming Convention

Folders

lowercase

Example

auth

dashboard

workspace

analytics

Files

PascalCase

Example

ResumeCard.jsx

Navbar.jsx

ATSChart.jsx

Variables

camelCase

Functions

camelCase

Constants

UPPER_CASE

---

# 6. CSS Rules

Never use inline CSS.

Use reusable classes.

Never hardcode colors.

Always use CSS variables.

Spacing must follow the design system.

---

# 7. JavaScript Rules

Use ES6+

Use

const

before

let

Never use

var

Always use

async/await

Avoid callback hell.

Split large functions.

---

# 8. Component Rules

One component = One responsibility.

Bad

Resume.jsx

Contains 1500 lines.

Good

Resume.jsx

ResumeHeader.jsx

ResumeSkills.jsx

ResumeProjects.jsx

ResumeEducation.jsx

ResumePreview.jsx

---

# 9. Maximum File Size

React Component

300 lines

Service

250 lines

Controller

250 lines

Utility

150 lines

If larger

Split it.

---

# 10. AI Prompt Rules

Always include context.

Example

"I already have a Navbar component.

Create only the Hero section.

Use our existing Button component.

Do not use Tailwind.

Use HTML CSS JS."

Bad Prompt

"Create Landing Page."

---

# 11. Never Generate Duplicate APIs

Before creating an endpoint

Check

routes/

Example

Don't create

/api/login

if

/auth/login

already exists.

---

# 12. Database Rules

Never create new collections

without discussion.

Always reuse schemas.

---

# 13. Git Rules

Never push directly to

main

Never push directly to

develop

Always

Feature Branch

↓

Pull Request

↓

Review

↓

Merge

---

# 14. Commit Rules

Use Conventional Commits.

Examples

feat:

fix:

docs:

style:

refactor:

test:

Example

feat: add ATS score component

fix: resolve login validation

docs: update architecture

---

# 15. Pull Request Rules

Every PR should include

✔ What changed

✔ Screenshots

✔ Tested

✔ Related issue

---

# 16. Before Every Commit

Run

✔ Project

✔ Build

✔ No Console Errors

✔ Responsive Check

✔ No Broken Routes

---

# 17. Console Rules

Never commit

console.log()

Use

console.error()

only when required.

Remove debug logs before merge.

---

# 18. Code Review Checklist

Before approving

Check

Folder

Naming

Performance

Responsive

Accessibility

Code duplication

Unused imports

Unused variables

---

# 19. AI Usage Rules

Allowed

✔ Boilerplate

✔ Refactoring

✔ Bug fixing

✔ Documentation

✔ Unit test generation

✔ API examples

✔ Regex

✔ Validation

Not Allowed

❌ Complete project generation

❌ Changing architecture

❌ Creating duplicate components

❌ Renaming folders

❌ Random dependencies

---

# 20. Dependency Rules

Before installing

Check

package.json

Don't install

different libraries

for the same job.

Example

Good

Only one chart library.

Bad

Chart.js

+

Recharts

+

ApexCharts

---

# 21. Responsive Rules

Desktop First

Laptop

Tablet

Mobile

Every page must work on all screen sizes.

---

# 22. Performance Rules

Lazy load pages.

Optimize images.

Avoid unnecessary re-renders.

Use debounce where needed.

Keep bundle size small.

---

# 23. Documentation Rules

Whenever you add

- API
- Feature
- Database
- Folder

Update documentation.

---

# 24. Communication Rules

Never assume.

If unsure

Ask first.

Don't rewrite another member's feature without discussion.

---

# 25. Golden Rule

AI is your assistant.

AI is NOT the architect.

The project documentation

(PRD.md)

(ARCHITECTURE.md)

(DESIGN.md)

(RULES.md)

is the source of truth.

If AI suggests something different,

Follow the documentation.
