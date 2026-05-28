# DRP_07

DRP_07 is a full-stack prototype for exploring how bereaved young adults can request reliable, convenient formal support from people and organisations with relevant shared experience.

The current product surface is intentionally small: a Next.js frontend lets someone submit a support request, and a Scala Play backend stores and returns those requests from PostgreSQL.

## Tech stack

| Area | Technology | Current use |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript | App Router client page for submitting and viewing support requests |
| Styling | Tailwind CSS 4 | Utility-first styling through `frontend/app/globals.css` |
| Backend | Play Framework 3, Scala 2.13 | JSON API, health check, and the original Play seed page |
| Backend DI | Guice | Eager startup binding for database migrations |
| Database | PostgreSQL | Stores support requests |
| Persistence | Slick 3.5 | Repository layer for PostgreSQL reads and writes |
| Migrations | Flyway 9 | Runs `conf/db/migration` migrations at backend startup |
| Backend tests | ScalaTest + Play test | Seed controller tests |
| Deployment | Dockerfile for backend, Vercel-compatible frontend | Backend image builds an sbt stage distribution; frontend expects `NEXT_PUBLIC_API_URL` |

## Repository layout

```text
.
├── backend/drp-backend/        # Scala Play backend
│   ├── app/controllers/        # HTTP controllers
│   ├── app/models/             # API/domain models and JSON formats
│   ├── app/repositories/       # Slick database access
│   ├── app/config/             # Database and Flyway configuration
│   ├── conf/routes             # Backend routes
│   ├── conf/db/migration/      # Flyway SQL migrations
│   ├── build.sbt               # Main backend build
│   └── Dockerfile              # Backend container build
└── frontend/                   # Next.js frontend
    ├── app/page.tsx            # Support request form and saved request list
    ├── app/layout.tsx          # App shell and metadata
    ├── app/globals.css         # Tailwind/global CSS
    └── package.json            # Frontend scripts and dependencies
```

## Prerequisites

- Node.js compatible with Next.js 16
- npm
- JDK 21
- sbt 1.12.x
- PostgreSQL database available through a `DATABASE_URL`

The backend currently reads database configuration only from `DATABASE_URL`. It expects a URL with credentials, for example:

```bash
postgres://username:password@host:5432/database_name
```

`DatabaseConfig` converts that value into a JDBC URL with `sslmode=require`, which matches hosted PostgreSQL providers. If you use a local PostgreSQL instance without SSL, this may need to be adjusted.

## Environment variables

### Backend

Set these before running the Play app:

```bash
export DATABASE_URL="postgres://username:password@host:5432/database_name"
export PLAY_HTTP_SECRET_KEY="replace-this-with-a-secure-secret"
```

`DATABASE_URL` is required for the repository and Flyway migration startup. `PLAY_HTTP_SECRET_KEY` is required for production-style runs and is also used by the Docker command.

### Frontend

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9000
```

The frontend uses this value when calling:

- `GET /support-requests`
- `POST /support-requests`

## Local development workflow

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Start the backend

```bash
cd backend/drp-backend
sbt run
```

By default, Play serves the backend at `http://localhost:9000`.

On startup, the backend eagerly runs Flyway migrations from:

```text
backend/drp-backend/conf/db/migration
```

The first migration creates the `support_requests` table.

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Next.js serves the frontend at `http://localhost:3000`.

## Available commands

### Frontend

Run these from `frontend/`.

```bash
npm run dev      # start the Next.js dev server
npm run build    # create a production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

### Backend

Run these from `backend/drp-backend/`.

```bash
sbt run          # start the Play app
sbt test         # run backend tests
sbt clean stage  # build the staged production app used by Docker
```

There is also a `build.sc` Mill build file from the Play seed, but the maintained workflow in this repo is currently `sbt`.

## API reference

### Health check

```http
GET /health
```

Response:

```json
{ "status": "ok" }
```

### List support requests

```http
GET /support-requests
```

Returns support requests sorted by newest first.

Example response:

```json
[
  {
    "id": 1,
    "name": "Alex",
    "email": "alex@example.com",
    "supportType": "Peer support group",
    "message": "I would like to speak to someone with a similar experience.",
    "status": "open",
    "createdAt": "2026-05-28T12:00:00"
  }
]
```

### Create a support request

```http
POST /support-requests
Content-Type: application/json
```

Request body:

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "supportType": "Peer support group",
  "message": "I would like to speak to someone with a similar experience."
}
```

The backend saves new requests with:

- `status`: `open`
- `createdAt`: current backend timestamp

## Data model

The first migration creates:

```sql
CREATE TABLE support_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    support_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

The API exposes `support_type` as `supportType` and `created_at` as `createdAt`.

## Deployment notes

### Frontend

The frontend is suitable for Vercel-style deployment. Configure:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-host
```

The backend CORS configuration currently allows:

- `http://localhost:3000`
- `https://drp-07.vercel.app`

Add any new frontend origin to `backend/drp-backend/conf/application.conf`.

### Backend Docker image

Build from `backend/drp-backend/`:

```bash
docker build -t drp-07-backend .
```

Run with:

```bash
docker run \
  -p 9000:9000 \
  -e PORT=9000 \
  -e DATABASE_URL="postgres://username:password@host:5432/database_name" \
  -e PLAY_HTTP_SECRET_KEY="replace-this-with-a-secure-secret" \
  drp-07-backend
```

The Dockerfile builds the app with JDK 21, installs sbt through Coursier, stages the Play distribution, then runs it on a JRE 21 image.

## Current status

- Frontend support request form is wired to the backend API.
- Frontend displays saved requests returned by the API.
- Backend supports health checks, creating support requests, and listing support requests.
- Database schema is managed by Flyway.
- Backend startup currently requires a reachable PostgreSQL database because migrations run eagerly.
- Backend tests are still the default Play seed tests and do not yet cover the support request API.
