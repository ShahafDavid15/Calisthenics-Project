# Calisthenics Project

[![CI](https://github.com/ShahafDavid15/Calisthenics-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/ShahafDavid15/Calisthenics-Project/actions/workflows/ci.yml)

אפליקציית ניהול חדר כושר – Full Stack.  
מאפשרת לחברי המועדון להירשם לאימונים, לרכוש מנויים, ולעקוב אחר התקדמות האימונים שלהם.  
למנהל: ניהול מנויים, אימונים, ודשבורד סטטיסטיקות.

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
| Testing | Jest + Supertest (61 tests) |
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
Node/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── repositories/    # Database queries
├── routes/          # Express routes + dependency wiring
├── middleware/      # Auth, validation
├── utils/           # Logger, email, PayPal client
├── __tests__/       # Jest unit + integration tests
├── server.js        # Entry point
└── app.js           # Express app (exported for testing)

React/
└── src/
    ├── pages/       # Main page components
    ├── components/  # Reusable UI components
    └── api.js       # Axios API client
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) or MariaDB

### 1. Clone the repository

```bash
git clone https://github.com/ShahafDavid15/Calisthenics-Project.git
cd Calisthenics-Project
```

### 2. Set up the database

```bash
# Import schema and demo data
mysql -u root -p < database/schema.sql
```

### 3. Create the admin user

```bash
cd Calisthenics-Project-main/simpleNodeReact-main/Node
node ../../database/create-admin.js
# Default credentials: admin / Admin1234
```

### 4. Configure environment variables

```bash
cd Calisthenics-Project-main/simpleNodeReact-main/Node
cp .env.example .env
# Edit .env with your values (DB credentials, JWT secret, email, PayPal)
```

### 5. Run the backend

```bash
cd Calisthenics-Project-main/simpleNodeReact-main/Node
npm install
npm start
# Server runs at http://localhost:3002
```

### 6. Run the frontend

```bash
cd Calisthenics-Project-main/simpleNodeReact-main/React
npm install
npm start
# App runs at http://localhost:3000
```

---

## Running Tests

```bash
cd Calisthenics-Project-main/simpleNodeReact-main/Node
npm test
```

**61 tests** across 7 test suites:

| Suite | Type | What's tested |
|-------|------|--------------|
| `workoutService` | Unit | Saturday block, duplicate slots, CRUD |
| `membershipService` | Unit | VAT calculation, CRUD |
| `userWorkoutService` | Unit | Weekly limits per membership type, booking, cancellation |
| `workoutExerciseService` | Unit | Future date block, CRUD |
| `userService` | Unit | Register, login, password validation |
| `auth.routes` | Integration | Login/register validation via HTTP |
| `membership.routes` | Integration | Auth guard, input validation via HTTP |

---

## Key Features

- **JWT Authentication** – protected routes, role-based access (user / admin)
- **Membership Plans** – Basic / Standard / Premium with different weekly workout limits
- **PayPal Integration** – sandbox payment flow for membership purchases
- **Email Notifications** – purchase confirmation, password reset, forgot username
- **Admin Dashboard** – user stats, income chart, most popular workout times
- **Workout Tracker** – personal exercise log with statistics per month
- **Input Validation** – centralized with `express-validator`, Hebrew error messages
- **Logging** – structured logs via Winston

---

## Environment Variables

See [`.env.example`](Calisthenics-Project-main/simpleNodeReact-main/Node/.env.example) for all required variables.

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host (default: localhost) |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (default: calisthenics) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password |
| `ALLOWED_ORIGINS` | CORS allowed origins |
| `PAYPAL_CLIENT_ID` | PayPal sandbox client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal sandbox secret |
| `PORT` | Server port (default: 3002) |
