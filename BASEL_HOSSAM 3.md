# Task — Basel Hossam

**Role:** Developer  
**Duration:** 1 Week  

---

## Project: Movies API — Production-Grade Backend

Build a **professional, scalable** backend service. This should be ready to grow — clean architecture, separation of concerns, and production conventions from day one.

---

### Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express
- **Storage:** Supabase (PostgreSQL) or Firebase Firestore
- **Validation:** Zod or Joi
- **Logging:** Pino or Winston

---

### Routes

```
GET    /movies          → list all movies (?search=title, ?page=1, ?limit=10)
POST   /movies          → create a movie { "title": "...", "year": 2024, "genre": "..." }
GET    /movies/:id      → get a single movie
PATCH  /movies/:id      → update a movie { "title"?: "...", "year"?: 2024, "genre"?: "..." }
DELETE /movies/:id      → delete a movie
```

---

### Project Structure

```
movies-api/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   └── movies/
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

Each layer has one job:
- **Controller** — parse request, call service, send response
- **Service** — business logic, orchestrates repository calls
- **Repository** — data access (Supabase / Firebase)
- **Validation** — Zod/Joi schemas used by middleware
- **Routes** — wire route → validation → controller

---

### Standards

| Area | Expectation |
|------|-------------|
| **Architecture** | Controller → Service → Repository pattern. No logic in route files. |
| **Error handling** | Custom error classes, global error handler middleware, consistent error response shape |
| **Validation** | Zod or Joi schemas enforced via middleware before controller |
| **Logging** | Structured logger (Pino/Winston) — request logging, error logging |
| **Config** | All env vars loaded from `.env` via config module with defaults |
| **Async** | Async/await with proper try/catch, no unhandled rejections |
| **Git** | Meaningful commits, conventional commit messages |
| **README** | Project overview, architecture diagram, setup, API docs |

---

### Submission

Submit via **GitHub repo link**. Send me the URL when done.

---

### Reference in SIA Tech Codebase

**Backend patterns:**
- `Backend/src/app.js` — Express setup pattern
- `Backend/src/middleware/` — error handler, validation middleware
- `Backend/src/lib/validate.js` — Zod usage
- `Backend/src/lib/errors.js` — custom error classes
- `Backend/src/routes/` — route organization

**Frontend patterns:**
- `Website/src/App.jsx` — React app structure with router
- `Website/src/components/` — reusable UI components
- `Website/src/pages/` — page-level components
- `Website/src/utils/` — utility/helper functions
- `Website/src/lib/api.js` — API client pattern

### Documentation

- **API docs** — add a `docs/api.md` file documenting all endpoints with request/response examples
- **Inline JSDoc** — document all exported functions (params, returns, errors thrown)
- **README** — project overview, architecture diagram (ASCII or text), setup steps, available scripts

---

### Allowed Tools

GitHub · Claude Code · Gemini CLI · Codex · OpenCode · Firebase · Supabase API
