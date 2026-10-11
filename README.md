# QuickNotes — System Design & Interactive Prototype

> A modern notes application featuring a responsive web client prototype and a comprehensive system design specification for a production-scale cloud backend supporting 1,000,000 users.

---

## 1. Project Overview

**QuickNotes** is a dual-scope software engineering project:
1. **Interactive Frontend Prototype:** A responsive, accessible single-page web application built with semantic HTML5, modern CSS3, and vanilla JavaScript. It demonstrates real-world client-side interactions, input validation, robust HTTP error handling, and safe DOM manipulation using the JSONPlaceholder demo REST API.
2. **Production System Design Specification:** An enterprise-grade architecture proposal detailing a production REST API (`docs/api-design.md`), a relational PostgreSQL schema (`docs/data-model.md`), and a high-availability cloud infrastructure design for 1,000,000 registered users (`docs/architecture.md`).

---

## 2. Distinction: Implemented Prototype vs. Proposed Backend

To maintain absolute clarity, the table below highlights what is currently implemented in the running prototype versus what is specified as a production architecture proposal:

| Dimension | Implemented Frontend Prototype | Proposed Production Backend |
| :--- | :--- | :--- |
| **Status** | **Fully functional & runnable today** | **Production design specification** |
| **User Interface** | Responsive SPA (`index.html`, `style.css`) | Same UI client pointed to production API |
| **API Integration** | Mock service: `jsonplaceholder.typicode.com/posts` | Dedicated microservices: `api.quicknotes.io/api/v1/*` |
| **Persistence** | In-memory session state (mutations simulated) | ACID PostgreSQL cluster (1 Primary + 2 Read Replicas) |
| **Authentication** | None (public prototype interface) | JWT Bearer access tokens with refresh rotation |
| **Authorization** | Mock single user (`userId: 1`) | Strict tenant isolation by `user_id` |
| **Data Validation** | Client-side validation (`title` required ≤ 100 chars; `body` optional) | Client-side and server-side schema validation |
| **DOM Rendering** | Safe DOM nodes (`document.createElement`, `textContent`) | Same client-side secure DOM model |
| **Infrastructure** | Client-side static hosting | Multi-AZ Cloud: CDN, WAF, ALB, API Gateway, Kubernetes, Redis, Queue |

---

## 3. What I Learned

Building this project provided deep practical insights across both frontend engineering and large-scale distributed system design:

### 3.1 Resilient API Integration & Error Handling
- **Centralized Network Abstraction:** Creating a single, reusable `request(url, options)` wrapper around `window.fetch` cleanly decoupled API logic from UI rendering. It centralized HTTP status code validation (checking `response.ok`), intercepted offline/DNS failures, and normalized error payloads into consistent `Error` objects.
- **Defensive User Feedback:** Implementing distinct visual feedback states (loading spinners, disabled buttons, accessible polite aria banners, and error callouts) ensures users never wonder whether a write operation succeeded or stalled.

### 3.2 Secure & Accessible DOM Manipulation
- **Eliminating XSS via Safe DOM APIs:** Replacing unsafe `innerHTML` concatenation with `document.createElement()`, `element.textContent`, and `element.replaceChildren()` guarantees that untrusted user input and third-party API payloads cannot execute malicious scripts, establishing zero-XSS vulnerability by design.
- **Form Semantics:** Designing strict input constraints—enforcing note titles as required (1–100 characters) while making note bodies optional—aligns interface flexibility with relational data modeling.

### 3.3 Relational Data Modeling with PostgreSQL
- **Transactional Integrity:** Designing multi-table operations (`users`, `notes`, `tags`, and `note_tags`) demonstrated why relational engines with ACID guarantees and foreign key cascades (`ON DELETE CASCADE`) are superior to document stores for multi-tenant, ownership-centric data.
- **Search Optimization:** Leveraging PostgreSQL's native Generalized Inverted Indexing (`GIN`) with English text stemming (`to_tsvector`) provides high-performance keyword search without the operational cost of managing a dedicated search cluster.

### 3.4 Scalable Cloud Architecture & Capacity Planning
- **Quantitative Sizing for 1M Users:** Estimating workload metrics (200k DAU, ~6M daily requests, ~70 average RPS, ~350 peak RPS, and ~95 GB storage) established clear sizing targets for compute instances, connection pools, and Redis memory caches.
- **Eliminating Single Points of Failure (SPOF):** Structuring multi-tier redundancy across Multi-AZ load balancers, stateless autoscaling compute pods, Redis Sentinel caching, and automated PostgreSQL failover guarantees 99.99% availability and rapid disaster recovery.

---

## 4. Project Structure

```text
quicknotes-system-design/
├── index.html              # Main web application structure and accessible form
├── style.css               # Responsive design, tokens, cards, and mobile styles
├── api.js                  # Centralized request wrapper, DOM rendering, and API logic
├── README.md               # Project overview, learnings, setup, and architecture summary
├── architecture.md         # Root reference copy of system architecture
└── docs/
    ├── api-design.md       # Production REST API specification (6 endpoints, auth, errors)
    ├── data-model.md       # PostgreSQL schema, DDL statements, constraints, indexes, joins
    └── architecture.md     # Production backend architecture for 1M users (capacity, SPOF, failover)
```

---

## 5. Getting Started & Setup Instructions

No backend installation, compilation step, or database server is required to run the frontend prototype.

### Option A: Direct Browser Launch
1. Download or clone this repository.
2. Locate `index.html` in your file explorer.
3. Double-click `index.html` (or right-click → Open With → Chrome / Firefox / Edge / Safari).

### Option B: Local Web Server (Recommended)
Using a lightweight local HTTP server avoids local file origin restrictions:

**Using VS Code Live Server:**
1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and click **"Open with Live Server"**.

**Using Node.js:**
```bash
npx serve .
# Open http://localhost:3000 in your browser
```

**Using Python:**
```bash
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

> **Prerequisite:** An active internet connection is required so the application can communicate with the external demo API (`https://jsonplaceholder.typicode.com`).

---

## 6. Prototype Demo Limitations

The client prototype connects to **JSONPlaceholder**, an open mock REST service:
- **Simulated Writes:** HTTP `POST` and `DELETE` requests succeed and return simulated status codes (HTTP 201 / HTTP 200), but the mock server does **not** permanently store changes on its backend.
- **Session-Scoped State:** To provide a realistic user experience, newly created notes and deletions are tracked in browser memory for the duration of the current session.
- **Page Refresh:** Refreshing the browser page resets the local session view and reloads the default sample notes from the API.

---

## 7. System Design Documentation Index

For complete technical specifications, see the detailed documentation in the `docs/` folder:

1. [**Production REST API Specification (`docs/api-design.md`)**](docs/api-design.md)
   Detailed contracts for 6 production endpoints (`GET/POST /notes`, `GET/PATCH/DELETE /notes/{id}`, `GET /tags`), JWT Bearer authentication, pagination, input validation, and RFC 7807 error examples (HTTP 400, 401, 403, 404, 409, 429, 500, 503).
2. [**Relational Data Model Specification (`docs/data-model.md`)**](docs/data-model.md)
   Complete PostgreSQL DDL statements for `users`, `notes`, `tags`, and `note_tags`. Covers primary/foreign keys, constraints, B-Tree and GIN indexes, example queries, and database selection justification.
3. [**Cloud System Architecture Specification (`docs/architecture.md`)**](docs/architecture.md)
   Capacity planning calculations for 1,000,000 users, Mermaid infrastructure diagram, and in-depth explanations of CDN, WAF, ALB, API Gateway, stateless compute, Redis caching, PostgreSQL replication, background queues, workers, monitoring, and automated failover.
