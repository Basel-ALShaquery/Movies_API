# API Reference Documentation

This document contains standard request, response, and error specifications for all endpoints available in the Movies API.

All endpoints are hosted on standard localhost:5000 in development:
`http://localhost:5000`

---

## 🟢 Health Check & Diagnostics

### GET `/health`
Validates overall container health and queries active connectivity directly to the Supabase PostgreSQL layer.

#### Request
* **Method:** `GET`
* **URL:** `/health`
* **Headers:** None

#### Response (200 OK - Successful Connection)
```json
{
  "status": "ok"
}
```

#### Response (503 Service Unavailable - Database Down)
```json
{
  "status": "error",
  "message": "Database unreachable",
  "details": "Connection refused"
}
```

---

## 🎬 Movie Resources (`/api/movies`)

### 1. GET `/api/movies`
Retrieves a paginated catalog list of all movie records. Supports filtering by title (case-insensitive search) and controlling pagination chunk sizes.

#### Request
* **Method:** `GET`
* **URL:** `/api/movies`
* **Headers:** None
* **Query Parameters:**
  * `search` (Optional String): Filters movies by title (matches partial case-insensitive matches).
  * `page` (Optional Integer): 1-based page index. Defaults to `1`.
  * `limit` (Optional Integer): Maximum records returned. Defaults to `100`, capped at `100` maximum.

#### Request Example
`GET http://localhost:5000/api/movies?search=Interstellar&page=1&limit=1`

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "36eef360-0683-4af9-aab8-289ee28a0fa0",
      "title": "Interstellar",
      "year": 2014,
      "genre": "Sci-Fi",
      "created_at": "2026-05-27T22:54:08.835408"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 1,
    "total": 2,
    "totalPages": 2
  }
}
```

---

### 2. POST `/api/movies`
Creates and registers a new movie record inside the catalog database.

#### Request
* **Method:** `POST`
* **URL:** `/api/movies`
* **Headers:** `Content-Type: application/json`
* **Request Body Parameters:**
  * `title` (Required String): Must be between 1 and 200 characters.
  * `year` (Required Integer): Must be an integer between 1888 and current year + 1.
  * `genre` (Required String): Must be between 1 and 100 characters.

#### Request Example
```json
{
  "title": "Interstellar",
  "year": 2014,
  "genre": "Sci-Fi"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "f1d0512d-2d51-4f22-bccd-6d73f2b8de26",
    "title": "Interstellar",
    "year": 2014,
    "genre": "Sci-Fi",
    "created_at": "2026-05-27T22:55:44.248107"
  }
}
```

---

### 3. GET `/api/movies/:id`
Retrieves details of a single specific movie by its unique identifier.

#### Request
* **Method:** `GET`
* **URL:** `/api/movies/:id`
* **Headers:** None
* **Path Parameters:**
  * `id` (Required String): Must be a valid UUID v4 string.

#### Request Example
`GET http://localhost:5000/api/movies/f1d0512d-2d51-4f22-bccd-6d73f2b8de26`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "f1d0512d-2d51-4f22-bccd-6d73f2b8de26",
    "title": "Interstellar",
    "year": 2014,
    "genre": "Sci-Fi",
    "created_at": "2026-05-27T22:55:44.248107"
  }
}
```

---

### 4. PATCH `/api/movies/:id`
Partially updates an existing movie's catalog specifications. At least one field must be supplied in the body.

#### Request
* **Method:** `PATCH`
* **URL:** `/api/movies/:id`
* **Headers:** `Content-Type: application/json`
* **Path Parameters:**
  * `id` (Required String): Must be a valid UUID v4 string.
* **Request Body Parameters:** (All Optional, but at least one must be provided)
  * `title` (String): Between 1 and 200 characters.
  * `year` (Integer): Integer between 1888 and current year + 1.
  * `genre` (String): Between 1 and 100 characters.

#### Request Example
```json
{
  "title": "Interstellar - Updated",
  "year": 2015
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "f1d0512d-2d51-4f22-bccd-6d73f2b8de26",
    "title": "Interstellar - Updated",
    "year": 2015,
    "genre": "Sci-Fi",
    "created_at": "2026-05-27T22:55:44.248107"
  }
}
```

---

### 5. DELETE `/api/movies/:id`
Permanently purges a movie from the database.

#### Request
* **Method:** `DELETE`
* **URL:** `/api/movies/:id`
* **Headers:** None
* **Path Parameters:**
  * `id` (Required String): Must be a valid UUID v4 string.

#### Request Example
`DELETE http://localhost:5000/api/movies/f1d0512d-2d51-4f22-bccd-6d73f2b8de26`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Movie deleted successfully"
}
```

---

## ⚠️ Error Responses

All system error responses adhere to a consistent JSON standard format to simplify client integration:

### 1. Request Validation Error (400 Bad Request)
Thrown when fields in headers, path, or body fail Zod schemas.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "path": "title",
        "message": "Title is required",
        "code": "invalid_type"
      },
      {
        "path": "year",
        "message": "Year must be a number",
        "code": "invalid_type"
      }
    ]
  }
}
```

### 2. Resource Not Found (404 Not Found)
Thrown when requesting a non-existent UUID or wrong route path.

```json
{
  "success": false,
  "error": {
    "code": "MOVIE_NOT_FOUND",
    "message": "Movie with id 36eef360-0683-4af9-aab8-289ee28a0fa0 not found",
    "statusCode": 404
  }
}
```

### 3. Rate Limit Exceeded (429 Too Many Requests)
Returned when an IP exceeds 100 requests within a 15-minute timeframe.

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later."
  }
}
```

### 4. Malformed JSON Parsing Error (400 Bad Request)
Thrown when a client sends invalid raw JSON in POST or PATCH request bodies.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Invalid JSON request body",
    "statusCode": 400
  }
}
```

### 5. Internal Server Error (500 Server Error)
Returned on unhandled system exceptions or programmer bugs. In production, stack traces are omitted, exposing only a generic message.

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred on the server",
    "statusCode": 500
  }
}
```
