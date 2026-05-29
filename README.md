# Movies API

A highly scalable, modern, production-ready RESTful API for managing a movie catalog. Built with **Node.js**, **Express**, **Supabase**, and **Zod** validation, featuring robust security, structured logging, and active container health checks.

---

## 🚀 Project Overview

The Movies API provides high-performance, stateless endpoints for creating, retrieving, updating, and deleting movie catalog records. Key features include:
* **Production Security:** Hardened HTTP security headers utilizing `helmet` and custom configurations.
* **Rate Limiting:** Global rate limiting with custom back-off limits to prevent Denial of Service (DoS) attacks.
* **Payload Sanitation:** Safe JSON payload parsing clamped at `1mb` to prevent CPU and memory exhaustion.
* **Active Health Probe:** Enriched `/health` endpoint that actively tests database connection status.
* **Structured Observability:** Ultra-fast structured request logging via `pino` and `pino-http`.
* **Database Layering:** Direct integration with PostgreSQL on Supabase via stateless PostgREST operations.

---

## 🏗️ Architecture

The project utilizes a clean **modular, layered architecture** enforcing a strict **Separation of Concerns (SoC)**. Request data flows sequentially down the pipeline and failures fail fast before reaching database layers.

```
Client
  ↓
Routes (Express Routing & Validation)
  ↓
Controllers (HTTP Handling & Statuses)
  ↓
Services (Business Logic & Normalization)
  ↓
Repositories (Data Access & Querying)
  ↓
Supabase (PostgreSQL Database)
```

### Components Guide:
* **Routes:** Receives the HTTP request and enforces schema validation before passing it downstream.
* **Controllers:** Handles HTTP-level details (extracting URL parameters, query properties, and formatting JSON responses).
* **Services:** Acts as the business logic hub, housing data normalization and business assertions.
* **Repositories:** Data Access Object (DAO) layer that communicates directly with the database.
* **Supabase:** The persistent cloud PostgreSQL instance hosting our tables.

---

## 🛠️ Setup & Installation

### Prerequisites
* **Node.js** (v20+ recommended)
* **npm** (v10+ recommended)

### 1. Clone the Repository & Navigate to Folder
```bash
cd C:\Users\basel.alshaqwery\Desktop\work\movies-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the project (or modify the existing one):
```ini
PORT=5000
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=<your-service-role-or-anon-key>
# Optional settings
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```
*(Ensure `SUPABASE_URL` is the base domain and does not end with `/rest/v1/`)*

---

## 🏃 Available Scripts

You can run the following commands inside the project directory:

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run dev`** | `nodemon src/server.js` | Starts the server in development mode with active file watching and automatic reloading. |
| **`npm start`** | `node src/server.js` | Starts the server in production mode without monitoring or auto-restart. |

---

## 📡 API Endpoints Summary

All feature endpoints are prefixed under `/api/movies`.

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/health` | Live service health check and active database ping. |
| `POST` | `/api/movies` | Create a new movie record in the catalog. |
| `GET` | `/api/movies` | Retrieve all movies with optional case-insensitive title search and page pagination. |
| `GET` | `/api/movies/:id` | Fetch a single movie catalog item by its UUID. |
| `PATCH` | `/api/movies/:id` | Update an existing movie's title, year, or genre. |
| `DELETE` | `/api/movies/:id` | Permanently delete a movie catalog record from the database. |

For detailed API payload schemas, request/response payloads, and error mappings, refer to the [API Documentation](file:///C:/Users/basel.alshaqwery/Desktop/work/movies-api/docs/api.md).
