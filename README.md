# Jobpipe

A clean fullstack job application tracking app built with **Angular** (frontend) and **NestJS** (backend), backed by **PostgreSQL**.

---

## Tech Stack

| Layer     | Technology           |
|-----------|----------------------|
| Frontend  | Angular 19 (standalone components) |
| Backend   | NestJS 10 (TypeScript) |
| Database  | PostgreSQL           |
| ORM       | TypeORM              |
| Auth      | JWT (passport-jwt)   |

---

## Features

- **Authentication** — Register and login with JWT
- **Applications** — Full CRUD for job applications with status tracking
- **Companies** — Full CRUD for companies
- **Dashboard** — Statistics by application status

---

## Project Structure

```
.
├── backend/          # NestJS API (port 3000)
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── applications/
│       ├── companies/
│       └── dashboard/
├── frontend/         # Angular SPA (port 4200)
│   └── src/app/
│       ├── core/
│       ├── features/
│       └── shared/
├── .env.example
├── AGENTS.md
└── README.md
```

---

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

---

## Getting Started

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd jobpipe
```

Create the backend `.env` file:

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and update the database credentials and JWT secret.

### 2. Create the database

```sql
CREATE DATABASE jobpipe;
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Start the backend

```bash
cd backend
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.

### 5. Start the frontend

```bash
cd frontend
npm start
```

The app will open at `http://localhost:4200`.

The Angular dev server proxies `/api` requests to `http://localhost:3000` automatically (see `frontend/proxy.conf.json`).

---

## API Endpoints

| Method | Path                        | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | /api/auth/register          | No   | Register a new user      |
| POST   | /api/auth/login             | No   | Login, get JWT token     |
| GET    | /api/applications           | Yes  | List user's applications |
| POST   | /api/applications           | Yes  | Create application       |
| GET    | /api/applications/:id       | Yes  | Get single application   |
| PUT    | /api/applications/:id       | Yes  | Update application       |
| DELETE | /api/applications/:id       | Yes  | Delete application       |
| GET    | /api/companies              | Yes  | List user's companies    |
| POST   | /api/companies              | Yes  | Create company           |
| GET    | /api/companies/:id          | Yes  | Get single company       |
| PUT    | /api/companies/:id          | Yes  | Update company           |
| DELETE | /api/companies/:id          | Yes  | Delete company           |
| GET    | /api/dashboard/stats        | Yes  | Get statistics           |

---

## Application Statuses

| Status    | Description                  |
|-----------|------------------------------|
| wishlist  | Saved for later              |
| applied   | Application submitted        |
| interview | Interview scheduled/ongoing  |
| offer     | Offer received               |
| rejected  | Application rejected         |

---

## Development

See [AGENTS.md](./AGENTS.md) for development rules, conventions, and commands.
