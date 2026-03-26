---
name: run-calisthenics
description: >-
  Bootstraps and runs the Calisthenics full-stack app (MySQL, Express on port
  3002, React on port 3000): database via Docker Compose or local schema import,
  backend .env, admin user script, npm install, and dev servers. Use when the
  user wants to run, start, develop, or set up the project locally, or after
  cloning the repository.
---

# Run Calisthenics locally

Assume repository root is the workspace. Execute commands from there unless noted.

## Prerequisites

- Node.js v18+
- Either **Docker** (recommended per README) or **MySQL** (local / XAMPP / MariaDB)

## 1. Database

**Option A — Docker (recommended)**

From project root:

```bash
docker compose up -d
```

- First start applies `database/schema.sql` automatically.
- In `backend/.env` use `DB_HOST=127.0.0.1` (especially on Windows; avoids IPv6 `::1` vs Docker IPv4).
- Default root password in compose is often `rootpass` and DB name `calisthenics` unless overridden in root `.env` for Compose variables.

**Option B — Local MySQL**

Import schema from project root:

```bash
mysql -u root -p < database/schema.sql
```

Match `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env` to the local server (XAMPP often has empty password for root).

## 2. Backend environment

```bash
cd backend
```

If `backend/.env` is missing, copy from `backend/.env.example` and set at minimum:

- `DB_*` — aligned with Docker or local MySQL
- `JWT_SECRET` — strong random string
- `ALLOWED_ORIGINS` — include `http://localhost:3000`
- `EMAIL_*`, `PAYPAL_*` — required for full features; server may start with placeholders but those flows will fail until configured

Full variable table: `README.md` and `backend/.env.example`.

## 3. Admin user

From **repository root** (not `backend/`):

```bash
node database/create-admin.js
```

Default login: `admin` / `Admin1234`. Required for admin UI and admin APIs.

## 4. Install and run

**Both apps from root (uses `concurrently`):**

```bash
npm install
npm start
```

**Or separately:**

```bash
cd backend && npm install && npm start
```

```bash
cd frontend && npm install && npm start
```

- Backend: `http://localhost:3002`
- Frontend: `http://localhost:3000` (proxies API to 3002 via `frontend/package.json` `proxy`)

## Windows notes

- **PowerShell**: importing SQL into a Docker MySQL container may need `Get-Content backup.sql | docker exec -i calisthenics-mysql mysql -uroot -prootpass calisthenics` instead of shell `<` redirection. See `README.md`.
- **Frontend**: `npm start` in `frontend` sets `NODE_OPTIONS=--openssl-legacy-provider` for older `react-scripts`; if that fails in PowerShell, run from CMD or set `NODE_OPTIONS` manually for that session.

## Tests (optional)

```bash
cd backend && npm test
```

## When the user only asked to "run" without setup

If MySQL is not running or `backend/.env` is missing, fix database and env first; do not assume `npm start` alone will work on a fresh clone.
