# AI-Powered Applicant Tracking System (ATS)

A full-stack applicant tracking system with a React frontend and Express/MongoDB backend. It supports recruiter and applicant accounts, job postings, resume uploads, application review, skill matching, and optional Gemini, AWS S3, and email integrations.

## Requirements

- Node.js 18 or later (Node.js 20 LTS is recommended)
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

1. From the project root, copy `server/.env.example` to `server/.env`.

   **Windows PowerShell:**
   ```powershell
   Copy-Item server/.env.example server/.env
   ```

   **macOS/Linux:**
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env`. Set `MONGO_URI` and replace `JWT_SECRET` with a long random secret. Add optional service keys only if you use those integrations.

3. Install all client and server dependencies from the project root:
   ```bash
   npm install
   ```

4. Start the frontend and backend together in one terminal:
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - API health check: http://localhost:5000/api/health

   Stop both processes with `Ctrl+C`.

## Other commands

```bash
npm run build
npm start
```

`npm start` starts the backend only. `npm run build` builds the frontend.

## Basic test workflow

1. Register an account with the Recruiter role.
2. Create a job with its description and required skills.
3. Register or log in with an Applicant account.
4. Browse jobs and apply with a PDF or DOCX resume (maximum 5 MB).
5. Log in as Recruiter to review ranked applications, inspect skill matches, download resumes, and update application status.

## Optional integrations

- If `GEMINI_API_KEY` is not configured, the application uses its local skill-overlap scoring fallback.
- Configure `GEMINI_API_KEY` and `GEMINI_MODEL` to enable Gemini analysis.
- Resume files are stored in `server/uploads` by default. Uploaded resumes are runtime data and are intentionally not included in this source ZIP.
- Configure the AWS variables in `server/.env` to use S3 storage.
- Configure the SMTP variables to send email notifications. Without SMTP configuration, notification previews are logged by the backend.

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/jobs`
- `POST /api/jobs` (recruiter)
- `PUT /api/jobs/:id` (job owner)
- `PATCH /api/jobs/:id/archive` (job owner)
- `POST /api/applications` (applicant; multipart fields: `jobId`, `resume`)
- `GET /api/applications/mine` (applicant)
- `GET /api/applications/recruiter` (recruiter)
- `PATCH /api/applications/:id/status` (recruiter)
- `GET /api/applications/:id/download` (authorized recruiter/applicant)

## Project structure

```text
.
├── client/       React + Vite frontend
├── server/       Express + MongoDB backend
├── package.json  Root npm workspace and combined scripts
├── README.md
└── .gitignore
```

## Production note

This is a development MVP, not a production-certified hiring system. Before production use, add audit logging, malware scanning, robust rate limiting, account recovery, retention and consent workflows, secure private object storage, and a formal bias and validity review of AI scoring. AI scores should be decision-support signals, not hiring decisions. Do not use protected or sensitive characteristics in screening.
