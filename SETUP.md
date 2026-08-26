# HireFlow AI — Setup & What Changed

## What was broken
`backend/package.json` pinned `"@google/genai": "^0.1.1"` — that version doesn't
exist on npm, so `npm install` inside `backend/` failed immediately and the
real backend could never start. Fixed to `^1.52.0` (same API surface, already
verified against `geminiService.js`).

## What I wired up (tested working)
- **`src/lib/api.ts`** — API client for the `backend/` server: auth
  (register/login/logout/me/profile), resumes (CRUD), and AI routes. Stores
  the JWT in `localStorage` and attaches it as `Authorization: Bearer <token>`
  automatically.
- **Login & Signup pages** — now call the real `/api/v1/auth/login` and
  `/api/v1/auth/register` endpoints instead of a fake `setTimeout`. Real
  error messages from the server (e.g. "email already exists") now show up.
- **Route guard** — `/app/*` and `/dashboard`-style routes redirect to
  `/login` if there's no valid session (`AppLayout.tsx`).
- **Logout** — Sidebar and Navbar logout buttons now actually clear the
  session (`auth.logout()`).
- **Navbar/Sidebar user info** — shows the real logged-in user's name/email
  instead of the hardcoded mock user.
- **`src/lib/resumeMapping.ts`** — translates between the editor's flat
  field shapes (`personalInfo`, `experiences`, a comma-separated `skills`
  string, etc.) and the backend's nested MongoDB schema, since they don't
  line up field-for-field.
- **Resume Editor** — loads a resume from the backend when opened as
  `/app/editor?id=<id>`; its existing autosave effect now also syncs to the
  backend, creating the resume in MongoDB on the very first save and
  autosaving to it after that. Shows a "Sync issue" indicator (instead of
  silently failing) if a save to the backend doesn't go through.
- **Dashboard** — fetches your real resume list from `/api/v1/resumes`;
  Delete and Duplicate call the real endpoints; "Edit" opens the real
  resume by id. If the backend can't be reached, it falls back to demo data
  with a visible banner instead of showing a broken page.

## What's still on mock data (not yet wired)
- **Resume Builder page** (`/app/builder`) — the *editor* (`/app/editor`) is
  wired to the backend; the separate Builder flow still isn't.
- **ATS Analysis / JD Match pages** — currently call the *lightweight*
  `server.ts` endpoints (unauthenticated, no DB save), not the backend's
  authenticated `/api/v1/ai/ats-analyze` / `/api/v1/ai/jd-match` routes.
- **Cloudinary uploads** (resume thumbnails, profile photo) — backend route
  exists (`/api/v1/resumes/:id/thumbnail`), not called from the UI yet.
- **Profile/Settings pages** — still show mock data, not wired to
  `/api/v1/auth/profile`.

## Logo & favicon
- Real favicon now wired up in `index.html` (`public/favicon.ico` + PNG sizes + apple-touch-icon), generated from your uploaded logo.
- The Sidebar's placeholder "R" square is now the real icon (`src/assets/logo-icon.png`).
- `brand-assets/` (project root) has ready-to-use exports: `navbar-logo-light.png` (icon + "HireFlow AI" wordmark, navy text for light backgrounds), `navbar-logo-dark.png` (white text, for dark backgrounds), and `icon-only.png`.

## Editor AI buttons (fixed)
Every "AI" button inside the Resume Editor — Rewrite Summary, Add Metrics,
Add STAR Metrics (Experience), Improve Bullet Points / Generate Description
(Projects), Suggest Missing Skills, and Apply AI / Apply All AI
Recommendations — previously just inserted the same hardcoded canned
sentences every time, regardless of your actual resume content. All of
these now call the real backend (`/api/v1/ai/suggest`, Gemini-powered) with
your actual resume data. Without a real `GEMINI_API_KEY` set, the backend
still responds for real, just with its own generic fallback text rather
than a fixed string picked from the frontend — set the key to get
genuinely generated content.

## Navigation & guest-access refactor
- **Resume Builder is now one page, not two.** `/app/builder` shows the
  Upload/Scratch/GitHub chooser when there's no resume yet, and shows the
  full editor in the same place once one exists — a state change, not a
  route change. The old `/app/editor` and `/editor` routes now redirect to
  `/app/builder` (keeping any `?id=...`) for backward compatibility.
- **Dashboard → "Continue Resume"** now opens your actual latest resume
  directly (`/app/builder?id=...`) instead of a blank editor. **"+ Create
  New"** explicitly forces the empty chooser state (`?new=1`), even if you
  have an unfinished draft, per your spec.
- **Guests can build, upload, import from GitHub, edit, preview, and
  export resumes** without an account — `AppLayout`'s auth guard now only
  blocks `/app/profile` and `/app/settings`, not the whole workspace.
- **AI features show a Login Required modal for guests** instead of
  running: Rewrite/Add Metrics/Enhance Experience/Improve Projects/Suggest
  Skills/Apply AI in the editor, Run Scan/Auto-Fix in ATS Analysis, sending
  a message to the AI Career Coach, and applying AI Suggestions. After
  logging in or signing up, you're returned to the exact page you were on
  (via a stored redirect), not dumped on the dashboard.
- **Removed** the "Browse / Comment" floating pill (`FloatingToolbar.tsx`)
  that appeared on every page — a leftover scaffolding widget, not part of
  the product.
- Sidebar already had no separate "Tailored Resume" nav item, so nothing
  needed removing there.

Happy to keep going on any of these — just say the word.

## Running it locally

**1. Get free credentials:**
- MongoDB Atlas: https://mongodb.com/cloud/atlas (free M0 cluster, copy the `mongodb+srv://...` string)
- Cloudinary: https://cloudinary.com (Cloud Name, API Key, API Secret from the dashboard)
- Gemini API key: https://aistudio.google.com/apikey

**2. Backend:**
```bash
cd backend
cp .env.example .env   # then paste in MONGO_URI, JWT_SECRET (any long random string),
                        # CLOUDINARY_*, GEMINI_API_KEY
npm install
npm run dev             # http://localhost:5000 — docs at /docs
```

**3. Frontend (separate terminal, from project root):**
```bash
cp .env.example .env    # VITE_API_URL already defaults to http://localhost:5000
npm install
npm run dev              # http://localhost:3000
```

**4. Test it:** open `http://localhost:3000/signup`, create an account — it
will hit your real backend, create a user in MongoDB, and log you into
`/dashboard` with a real JWT session. Then click "+ Create New" / "Edit" on
a resume to open the editor — start typing and it'll auto-create/autosave
the resume to MongoDB (watch the "Auto Saved" pill in the top bar).

**Note:** if `MONGO_URI` isn't set to a real Atlas cluster yet, requests
like register/login will return a clean JSON error after ~10s ("buffering
timed out") instead of crashing the server — that's expected, and confirms
the error handling works; it'll resolve itself once you plug in a real
connection string.

## Google OAuth Authentication Setup

To enable real Google OAuth login ("Continue with Google"):

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
   - Click **Create Credentials** -> **OAuth Client ID** -> Select **Web application**.
   - Add **Authorized JavaScript origins**:
     - Development: `http://localhost:5173` (or your frontend port)
     - Production: `https://your-domain.com`
   - Add **Authorized redirect URIs**:
     - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`

2. **Supabase Auth Provider Setup:**
   - Go to your **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Google**.
   - Toggle **Enable Google provider**.
   - Copy **Client ID** and **Client Secret** from Google Cloud Console and paste them into Supabase.
   - Save changes.

3. **Client Environment Setup:**
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are defined in your local `.env`.
   - Restart the frontend development server (`npm run dev`).

