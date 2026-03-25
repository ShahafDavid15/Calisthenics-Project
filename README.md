# Calisthenics Project

[![CI](https://github.com/ShahafDavid15/Calisthenics-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/ShahafDavid15/Calisthenics-Project/actions/workflows/ci.yml)

A **full-stack web app** for **bodyweight (calisthenics) training**.  
Members can book sessions, purchase memberships, and track their workout progress.  
For admins: membership and session management, plus a statistics dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Frontend | React |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| Payments | PayPal SDK |
| Email | Nodemailer (Gmail) |
| Logging | Winston |
| Testing | Jest + Supertest (66 tests) |
| CI | GitHub Actions |

---

## Architecture

The backend follows a strict **Layered Architecture** with **Dependency Injection (DIP)**:

```
Route → Controller → Service → Repository → Database
```

- **Repository** – all SQL queries, no business logic
- **Service** – business logic only, receives repository via constructor
- **Controller** – handles HTTP req/res, delegates to service
- **Route** – wires dependencies and defines endpoints

---

## Project Structure

```
backend/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── repositories/    # Database queries
├── routes/          # Express routes + dependency wiring
├── middleware/      # Auth, validation
├── utils/           # Logger, email, PayPal client
├── __tests__/       # Jest unit + integration tests
├── server.js        # Entry point
└── app.js           # Express app (exported for testing)

frontend/
└── src/
    ├── pages/       # Main page components
    ├── components/  # Reusable UI components
    └── utils/       # API client (api.js)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- MySQL — either **Docker** (see below) or [local MySQL](https://www.mysql.com/) / XAMPP / MariaDB

### 1. Clone the repository

```bash
git clone https://github.com/ShahafDavid15/Calisthenics-Project.git
cd Calisthenics-Project
```

### 2. Set up the database

**Option A — Docker (no XAMPP needed)**

```bash
docker compose up -d
```

On first start, `database/schema.sql` is applied automatically. In `backend/.env` use **`DB_HOST=127.0.0.1`** (avoids IPv6 `::1` connection issues on Windows) and **`DB_PASSWORD=rootpass`** (default root password from `docker-compose.yml` unless you changed it).

`docker compose` reads variables from a **`.env` file in the project root** (same folder as `docker-compose.yml`) for `${DB_PASSWORD}` / `${DB_NAME}`. If you only set passwords in `backend/.env`, Compose still uses the compose defaults (`rootpass`, `calisthenics`) — which matches the README’s Docker setup. To override the DB password for the container, add `DB_PASSWORD=...` to **root** `.env` or export it before `docker compose up`.

**Option B — Local MySQL / XAMPP**

```bash
# Import schema and demo data
mysql -u root -p < database/schema.sql
```

Use `DB_HOST=127.0.0.1` or `localhost` and your local root password (often empty for XAMPP).

#### Copying an existing database (e.g. XAMPP) into Docker MySQL

Docker uses its **own** data volume: users and rows from XAMPP do **not** appear automatically. One-time migration:

1. On the machine where XAMPP runs, export (replace `root` / password if needed):

   ```bash
   mysqldump -u root -p calisthenics > calisthenics-backup.sql
   ```

2. With Docker MySQL running (`docker compose up -d`), import into the container (`container_name` in `docker-compose.yml` is `calisthenics-mysql`; use your `MYSQL_ROOT_PASSWORD`, default `rootpass`):

   ```bash
   docker exec -i calisthenics-mysql mysql -uroot -prootpass calisthenics < calisthenics-backup.sql
   ```

   On **PowerShell**, input redirection differs; use:

   ```powershell
   Get-Content calisthenics-backup.sql | docker exec -i calisthenics-mysql mysql -uroot -prootpass calisthenics
   ```

   Or import from the host with the `mysql` client against `127.0.0.1` using the same credentials as `backend/.env`.

After import, ensure there is exactly one admin account you trust; then run `node database/create-admin.js` if you use the canonical **`admin`** user (see below).

### 3. Create the admin user

```bash
node database/create-admin.js
# Default credentials: admin / Admin1234
```

This creates or updates the **`admin`** user with **`role = admin`** (required for admin API routes and UI). **Registration cannot use the username `admin`** and cannot assign the admin role — only this script (or direct DB access) can make someone admin. Running the script **demotes any other users** who had `role = admin` to `user`, so only the `admin` account stays privileged. **After changing the role, log out and log in again** so your JWT includes `role: "admin"`.

### 4. Configure environment variables

**Backend** — copy the example file and fill in real values:

```bash
cd backend
cp .env.example .env
# Edit .env: DB_*, JWT_SECRET, EMAIL_*, PAYPAL_* (see table below)
```

**PayPal (Sandbox)** — create a REST app under [PayPal Developer → Sandbox apps](https://developer.paypal.com/dashboard/applications/sandbox). Put **Client ID** and **Secret** from the **same** app into `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`. Use **`PAYPAL_ENV=sandbox`** for local development. If you see **Client Authentication failed**, the secret is wrong, or Live/Sandbox is mixed with the keys.

**Currency** — default checkout currency is **ILS** (aligned with ₪ prices on the purchase page). Optional: set `PAYPAL_CURRENCY=USD` in `backend/.env` if your Sandbox account rejects ILS. The frontend loads currency from `GET /api/purchases/paypal-client-id` when possible.

**Email (Gmail)** — use **`EMAIL_USER`** (Gmail address) and **`EMAIL_PASS`** ([Google App Password](https://myaccount.google.com/apppasswords), not your normal Gmail password; 2FA must be on). Required for:

- **Receipt email** after a successful membership purchase (HTML, sent to the user’s profile email; skipped if the user has no email)
- **Profile update** confirmation (HTML)
- Password reset / forgot-username flows

If email is not configured, those calls fail with a clear error; purchase and profile save still succeed where applicable, and failures are logged on the server.

**Frontend (optional)** — If `PAYPAL_CLIENT_ID` is set in `backend/.env`, PayPal buttons can load the public Client ID from the server (no `frontend/.env` needed). You may set `REACT_APP_PAYPAL_CLIENT_ID` / `REACT_APP_PAYPAL_CURRENCY` in `frontend/.env` for offline-first dev — see [`frontend/.env.example`](frontend/.env.example). Restart `npm start` after any frontend env change.

### 5. Run the backend

```bash
cd backend
npm install
npm start
# Server runs at http://localhost:3002
```

### 6. Run the frontend

```bash
cd frontend
npm install
npm start
# App runs at http://localhost:3000
```

### Or run both together from the root

```bash
npm install
npm start
```

---

## Running Tests

```bash
cd backend
npm test
```

**66 tests** across 8 test suites:

| Suite | Type | What's tested |
|-------|------|--------------|
| `workoutService` | Unit | Saturday block, duplicate slots, CRUD |
| `membershipService` | Unit | VAT calculation, CRUD |
| `userWorkoutService` | Unit | Weekly limits per membership type, booking, cancellation |
| `workoutExerciseService` | Unit | Future date block, CRUD |
| `userService` | Unit | Register, login, password validation |
| `auth.routes` | Integration | Login/register validation via HTTP |
| `membership.routes` | Integration | Auth guard, input validation via HTTP |
| `purchases.public` | Integration | Public PayPal client-id endpoint |

---

## Key Features

- **JWT Authentication** – protected routes, role-based access (user / admin)
- **Membership Plans** – Basic / Standard / Premium with different weekly workout limits
- **PayPal Integration** – Sandbox (or Live) orders; default currency ILS unless overridden
- **Email** – purchase **receipt** (HTML), **profile update** notice, expiring-membership cron, password reset / forgot username (Gmail + App Password)
- **Profile** – **membership history** table (past purchases / periods)
- **Admin Dashboard** – user stats, income chart, most popular workout times
- **Admin Members** – user list with membership and expiry (username / email / plan columns LTR for readability)
- **Workout Tracker** – personal exercise log with statistics per month
- **Input Validation** – centralized with `express-validator`, Hebrew error messages
- **Logging** – structured logs via Winston
- **Cron** – daily workout seeding (02:00) and expiring-membership emails (08:00; server local time — see `backend/app.js`)

---

## Environment Variables

See [`.env.example`](backend/.env.example) for all required variables.

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host (use `127.0.0.1` with Docker on Windows) |
| `DB_USER` | MySQL user (usually `root` locally) |
| `DB_PASSWORD` | MySQL password (`rootpass` matches default Docker Compose) |
| `DB_NAME` | Database name (default: `calisthenics`) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `EMAIL_USER` | Gmail address for sending mail |
| `EMAIL_PASS` | Gmail [App Password](https://myaccount.google.com/apppasswords) (cannot be viewed again after creation — generate a new one if lost) |
| `ALLOWED_ORIGINS` | CORS allowed origins (e.g. `http://localhost:3000`) |
| `PAYPAL_ENV` | `sandbox` or `live` |
| `PAYPAL_CLIENT_ID` | PayPal REST app Client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal REST app secret (same app as Client ID) |
| `PAYPAL_CURRENCY` | Optional; default **ILS**. Set `USD` if Sandbox rejects ILS |
| `PORT` | Server port (default: 3002) |

**Frontend** (`frontend/.env`) — see [`frontend/.env.example`](frontend/.env.example).

| Variable | Description |
|----------|-------------|
| `REACT_APP_PAYPAL_CLIENT_ID` | Optional if backend exposes Client ID via `/api/purchases/paypal-client-id` |
| `REACT_APP_PAYPAL_CURRENCY` | Optional; should match backend when SDK loads before the API |
| `REACT_APP_API_URL` | Optional API base; leave empty to use CRA `proxy` to the backend |
