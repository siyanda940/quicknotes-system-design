# QuickNotes Production REST API Specification

> **Specification Version:** 1.0.0
> **Status:** Proposed Production Backend Design
> **Target Base URL:** `https://api.quicknotes.io/api/v1`
> **Demo Implementation Notice:** The current frontend application (`index.html` + `api.js`) is an interactive prototype that integrates with the JSONPlaceholder mock service to demonstrate client-side UX, validation, and error states. This document defines the formal production REST API specification intended for backend implementation.

---

## 1. Overview & Architectural Principles

The QuickNotes API is designed as a stateless, resource-oriented RESTful web service adhering to modern industry standards:

- **Protocol:** HTTPS (TLS 1.3 strictly enforced, HSTS enabled).
- **Format:** JSON (`Content-Type: application/json; charset=utf-8`).
- **URI Versioning:** All endpoints are versioned under `/api/v1/`.
- **Resource Identifiers:** Universally Unique Identifiers (UUIDv4) prevent sequential enumeration attacks.
- **Timestamps:** ISO 8601 extended UTC format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Data Contract:** Note titles are strictly required (1–100 characters). Note bodies are optional (0–20,000 characters).

---

## 2. Authentication & Authorization

All API endpoints (except public authentication routes `/auth/login` and `/auth/register`) require authentication via JSON Web Tokens (JWT).

### 2.1 Authentication Header
Clients must provide an access token in the `Authorization` request header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- **Access Token:** Short-lived JWT (15-minute expiration) containing user identity and assigned scopes.
- **Refresh Token:** Long-lived cryptographically secure token (7-day rotation) used to obtain new access tokens.

### 2.2 Authorization & Tenant Isolation
Every query is scoped strictly to the authenticated user (`user_id` parsed from the validated JWT claims).
- Users have full CRUD access only over their own notes and tags.
- Attempts to query or mutate notes belonging to other users will result in an immediate `403 Forbidden` (or `404 Not Found` where metadata disclosure must be prevented).

---

## 3. Global Response Envelope & Pagination

### 3.1 Single Resource Envelope
```json
{
  "success": true,
  "data": { ... }
}
```

### 3.2 Collection Envelope with Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 48,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 4. Endpoints Specification

### 4.1 GET `/api/v1/notes`
Retrieves a paginated list of notes owned by the authenticated user. Supports keyword filtering, tag filtering, and sorting.

#### Request
- **Method:** `GET`
- **Path:** `/api/v1/notes`
- **Headers:**
  - `Authorization: Bearer <jwt_access_token>`

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | Integer | No | `1` | Page index (minimum: 1). |
| `limit` | Integer | No | `20` | Items per page (minimum: 1, maximum: 100). |
| `search` | String | No | — | Filter notes matching title or body keywords. |
| `tagId` | UUID | No | — | Filter notes assigned to a specific tag. |
| `sortBy` | String | No | `updatedAt` | Sort attribute: `createdAt`, `updatedAt`, `title`. |
| `order` | String | No | `desc` | Sort direction: `asc`, `desc`. |

#### Response: HTTP 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "b9a52861-c8ef-417d-9477-d06900a6e351",
      "userId": "3c490a18-5a26-4b2a-bf34-7ad088da1528",
      "title": "System Design Architecture Review",
      "body": "Review the microservices architecture, caching layers, and database replica topology.",
      "tags": [
        {
          "id": "11d1ecbb-eec0-4a84-916c-e0c20ab99c14",
          "name": "Engineering",
          "color": "#6658d3"
        }
      ],
      "createdAt": "2026-10-11T12:00:00.000Z",
      "updatedAt": "2026-10-11T14:30:00.000Z"
    },
    {
      "id": "f516db19-48ce-4ae5-b2fb-3d8435d67683",
      "userId": "3c490a18-5a26-4b2a-bf34-7ad088da1528",
      "title": "Grocery checklist",
      "body": null,
      "tags": [],
      "createdAt": "2026-10-11T09:15:00.000Z",
      "updatedAt": "2026-10-11T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 4.2 POST `/api/v1/notes`
Creates a new note for the authenticated user.

#### Request
- **Method:** `POST`
- **Path:** `/api/v1/notes`
- **Headers:**
  - `Authorization: Bearer <jwt_access_token>`
  - `Content-Type: application/json`
  - `Idempotency-Key: <uuid>` *(Optional, protects against duplicate network retry submissions)*

#### Request Body Schema
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | Trimmed, 1 to 100 characters. Cannot be blank. |
| `body` | String | No | Optional. Plain text or Markdown, max 20,000 characters. Null allowed. |
| `tagIds` | Array of UUIDs | No | Optional. Array of up to 10 valid user tag IDs. |

#### Request Example
```json
{
  "title": "Sprint retrospective ideas",
  "body": "Discuss asynchronous standups and automated deployment pipelines.",
  "tagIds": [
    "11d1ecbb-eec0-4a84-916c-e0c20ab99c14"
  ]
}
```

#### Response: HTTP 201 Created
- **Header:** `Location: /api/v1/notes/7a931a54-44df-416b-9c59-bf728e9d29ef`
```json
{
  "success": true,
  "data": {
    "id": "7a931a54-44df-416b-9c59-bf728e9d29ef",
    "userId": "3c490a18-5a26-4b2a-bf34-7ad088da1528",
    "title": "Sprint retrospective ideas",
    "body": "Discuss asynchronous standups and automated deployment pipelines.",
    "tags": [
      {
        "id": "11d1ecbb-eec0-4a84-916c-e0c20ab99c14",
        "name": "Engineering",
        "color": "#6658d3"
      }
    ],
    "createdAt": "2026-10-11T15:45:00.000Z",
    "updatedAt": "2026-10-11T15:45:00.000Z"
  }
}
```

---

### 4.3 GET `/api/v1/notes/{noteId}`
Fetches a single note by its UUID.

#### Request
- **Method:** `GET`
- **Path:** `/api/v1/notes/{noteId}`
- **Path Parameter:** `noteId` (UUIDv4)
- **Headers:**
  - `Authorization: Bearer <jwt_access_token>`

#### Response: HTTP 200 OK
```json
{
  "success": true,
  "data": {
    "id": "7a931a54-44df-416b-9c59-bf728e9d29ef",
    "userId": "3c490a18-5a26-4b2a-bf34-7ad088da1528",
    "title": "Sprint retrospective ideas",
    "body": "Discuss asynchronous standups and automated deployment pipelines.",
    "tags": [
      {
        "id": "11d1ecbb-eec0-4a84-916c-e0c20ab99c14",
        "name": "Engineering",
        "color": "#6658d3"
      }
    ],
    "createdAt": "2026-10-11T15:45:00.000Z",
    "updatedAt": "2026-10-11T15:45:00.000Z"
  }
}
```

---

### 4.4 PATCH `/api/v1/notes/{noteId}`
Partially updates an existing note's fields. Only provided attributes are modified.

#### Request
- **Method:** `PATCH`
- **Path:** `/api/v1/notes/{noteId}`
- **Path Parameter:** `noteId` (UUIDv4)
- **Headers:**
  - `Authorization: Bearer <jwt_access_token>`
  - `Content-Type: application/json`
  - `If-Match: "etag_value"` *(Optional optimistic concurrency control header)*

#### Request Body Schema
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `title` | String | No | 1 to 100 characters if supplied. Cannot be blank. |
| `body` | String | No | Max 20,000 characters. May be set to `null` or `""` to clear body. |
| `tagIds` | Array of UUIDs | No | Replaces the note's assigned tag collection. |

#### Request Example
```json
{
  "title": "Sprint retrospective ideas (Revised)",
  "body": "Updated discussion points with team feedback."
}
```

#### Response: HTTP 200 OK
```json
{
  "success": true,
  "data": {
    "id": "7a931a54-44df-416b-9c59-bf728e9d29ef",
    "userId": "3c490a18-5a26-4b2a-bf34-7ad088da1528",
    "title": "Sprint retrospective ideas (Revised)",
    "body": "Updated discussion points with team feedback.",
    "tags": [
      {
        "id": "11d1ecbb-eec0-4a84-916c-e0c20ab99c14",
        "name": "Engineering",
        "color": "#6658d3"
      }
    ],
    "createdAt": "2026-10-11T15:45:00.000Z",
    "updatedAt": "2026-10-11T16:10:00.000Z"
  }
}
```

---

### 4.5 DELETE `/api/v1/notes/{noteId}`
Deletes an existing note owned by the authenticated user.

#### Request
- **Method:** `DELETE`
- **Path:** `/api/v1/notes/{noteId}`
- **Path Parameter:** `noteId` (UUIDv4)
- **Headers:**
  - `Authorization: Bearer <jwt_access_token>`

#### Response: HTTP 204 No Content
- **Status:** `204 No Content`
- **Body:** Empty

---

### 4.6 GET `/api/v1/tags`
Retrieves all tags created by or available to the authenticated user, including active note counts.

#### Request
- **Method:** `GET`
- **Path:** `/api/v1/tags`
- **Headers:**
  - `Authorization: Bearer <jwt_access_token>`

#### Response: HTTP 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "11d1ecbb-eec0-4a84-916c-e0c20ab99c14",
      "userId": "3c490a18-5a26-4b2a-bf34-7ad088da1528",
      "name": "Engineering",
      "color": "#6658d3",
      "noteCount": 12,
      "createdAt": "2026-10-01T08:00:00.000Z"
    },
    {
      "id": "52e46b9a-4fd2-4b20-9dc4-839f99db731c",
      "userId": "3c490a18-5a26-4b2a-bf34-7ad088da1528",
      "name": "Personal",
      "color": "#17845d",
      "noteCount": 5,
      "createdAt": "2026-10-02T10:15:00.000Z"
    }
  ]
}
```

---

## 5. Input Validation Rules

| Entity / Field | Validation Rule | HTTP Error Code |
| :--- | :--- | :--- |
| `note.title` | Required for creation. String, 1–100 characters. Cannot be whitespace-only. | `400 Bad Request` |
| `note.body` | Optional. String, max 20,000 characters. Null or empty string permitted. | `400 Bad Request` |
| `note.tagIds` | Optional array of valid UUIDv4 strings. Max 10 tags per note. Each tag must belong to the user. | `400 Bad Request` |
| `tag.name` | Required for creation. String, 1–50 characters. Unique per user. | `400 Bad Request` / `409 Conflict` |
| `tag.color` | Valid 7-character hexadecimal color string (`^#([A-Fa-f0-9]{6})$`). | `400 Bad Request` |

---

## 6. Standard Error Response Specification

All API errors return consistent JSON payloads conforming to RFC 7807 structured problem representations.

### Common Error Schema
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_ENUM",
    "message": "Human readable summary of the error.",
    "status": 400,
    "timestamp": "2026-10-11T16:20:00.000Z",
    "path": "/api/v1/notes",
    "requestId": "req_84f9b2d87e1a",
    "details": []
  }
}
```

---

### 6.1 HTTP 400 Bad Request
Returned when input payload fails validation constraints (e.g., missing title or title exceeding 100 characters).

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request payload failed schema validation.",
    "status": 400,
    "timestamp": "2026-10-11T16:20:01.000Z",
    "path": "/api/v1/notes",
    "requestId": "req_a1b2c3d4",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must not exceed 100 characters."
      }
    ]
  }
}
```

---

### 6.2 HTTP 401 Unauthorized
Returned when authentication credentials (Bearer token) are missing, invalid, or expired.

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token is missing or has expired. Please log in again.",
    "status": 401,
    "timestamp": "2026-10-11T16:20:02.000Z",
    "path": "/api/v1/notes",
    "requestId": "req_b2c3d4e5",
    "details": []
  }
}
```

---

### 6.3 HTTP 403 Forbidden
Returned when an authenticated user attempts to access or mutate a resource belonging to another tenant/user.

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access or modify this note.",
    "status": 403,
    "timestamp": "2026-10-11T16:20:03.000Z",
    "path": "/api/v1/notes/991a4570-51a8-48b2-b529-699745124018",
    "requestId": "req_c3d4e5f6",
    "details": []
  }
}
```

---

### 6.4 HTTP 404 Not Found
Returned when the requested resource identifier does not exist.

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested note could not be found.",
    "status": 404,
    "timestamp": "2026-10-11T16:20:04.000Z",
    "path": "/api/v1/notes/00000000-0000-0000-0000-000000000000",
    "requestId": "req_d4e5f6a7",
    "details": []
  }
}
```

---

### 6.5 HTTP 409 Conflict
Returned when a state conflict occurs, such as a duplicate tag name for the user or an optimistic locking collision via `If-Match`.

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_CONFLICT",
    "message": "A tag with the name 'Engineering' already exists for your account.",
    "status": 409,
    "timestamp": "2026-10-11T16:20:05.000Z",
    "path": "/api/v1/tags",
    "requestId": "req_e5f6a7b8",
    "details": [
      {
        "field": "name",
        "message": "Tag name must be unique per user."
      }
    ]
  }
}
```

---

### 6.6 HTTP 429 Too Many Requests
Returned when client request frequency exceeds allowed rate limits. Includes the `Retry-After` header indicating seconds until the window resets.

**Headers:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1760199645
```

**Body:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Maximum 120 requests per minute allowed.",
    "status": 429,
    "timestamp": "2026-10-11T16:20:06.000Z",
    "path": "/api/v1/notes",
    "requestId": "req_f6a7b8c9",
    "details": [
      {
        "retryAfterSeconds": 45
      }
    ]
  }
}
```

---

### 6.7 HTTP 500 Internal Server Error
Returned when an unexpected, unhandled server-side failure occurs. To protect system security, internal database stack traces are suppressed and replaced with an opaque `requestId` for correlation in backend logs.

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred while processing your request. Please contact support with the requestId.",
    "status": 500,
    "timestamp": "2026-10-11T16:20:07.000Z",
    "path": "/api/v1/notes",
    "requestId": "req_99887766-err-prod",
    "details": []
  }
}
```

---

### 6.8 HTTP 503 Service Unavailable
Returned when downstream infrastructure is temporarily unavailable (e.g., active database failover, scheduled maintenance window, or circuit breaker tripped).

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The service is temporarily unavailable due to scheduled database maintenance. Please retry shortly.",
    "status": 503,
    "timestamp": "2026-10-11T16:20:08.000Z",
    "path": "/api/v1/notes",
    "requestId": "req_11223344-maint",
    "details": [
      {
        "estimatedDowntimeSeconds": 60
      }
    ]
  }
}
```

---

## 7. Comparison: Prototype Client vs. Production Specification

| Aspect | Frontend Prototype (`index.html` + `api.js`) | Proposed Production REST API |
| :--- | :--- | :--- |
| **Backend Integration** | JSONPlaceholder mock service (`/posts`) | Dedicated microservice cluster (`/api/v1/*`) |
| **Data Persistence** | In-memory session state (mutations simulated) | ACID-compliant PostgreSQL relational storage |
| **Authentication** | None (public demo interface) | JWT Bearer authentication with refresh rotation |
| **Authorization** | Client-side mock user (`userId: 1`) | Multi-tenant row-level authorization per user |
| **Note Body Constraint** | Optional field (up to 2,000 characters) | Optional field (up to 20,000 characters) |
| **Tags Capability** | Visual static pill in UI | Full relational tag management (`GET /tags`, `note_tags`) |
| **Error Handling** | Client `request()` wrapper catching network & HTTP codes | RFC 7807 structured JSON with standard status codes |
