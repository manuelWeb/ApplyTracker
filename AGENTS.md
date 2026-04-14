# ApplyTracker — AGENTS.md

Development rules, conventions, and commands for contributors and AI agents.

---

## Project Structure

```
ApplyTracker/
├── backend/          # NestJS API
│   └── src/
│       ├── auth/         # JWT authentication
│       ├── users/        # User entity and service
│       ├── applications/ # Job application CRUD
│       ├── companies/    # Company CRUD
│       └── dashboard/    # Statistics
└── frontend/         # Angular SPA
    └── src/app/
        ├── core/         # Services, guards, interceptors
        ├── features/     # Route-level components
        └── shared/       # Shared models and utilities
```

---

## Commands

### Backend

```bash
cd backend
npm install
npm run start:dev      # Start in watch mode
npm run build          # Compile TypeScript
npm run test           # Run unit tests
npm run lint           # Lint with ESLint
```

### Frontend

```bash
cd frontend
npm install
npm start              # Start dev server (http://localhost:4200)
npm run build          # Production build
npm test               # Run Karma tests
```

---

## Development Rules

### General

- TypeScript everywhere — no `any` if avoidable
- Keep commits atomic and focused
- No over-engineering: solve the problem, don't predict future problems

### Backend (NestJS)

- Each feature lives in its own module folder (auth, users, applications, companies, dashboard)
- All DTOs must use `class-validator` decorators
- Controllers should be thin — business logic goes in services
- All routes except `/api/auth/*` require `JwtAuthGuard`
- User data is always scoped by `userId` (no cross-user data access)
- Use `PartialType` from `@nestjs/mapped-types` for update DTOs

### Frontend (Angular)

- All components are **standalone** — no NgModule
- Use `inject()` instead of constructor injection
- Use Angular's `@if`, `@for` control flow syntax (Angular 17+)
- Lazy-load all feature components via `loadComponent` in routes
- HTTP calls go through services only — never directly in components
- The `AuthInterceptor` automatically attaches the Bearer token
- Use **Tailwind CSS** utility classes for styling; avoid writing custom CSS unless necessary
- Keep component-level `styles` minimal — prefer Tailwind utilities in templates

### Database

- TypeORM `synchronize: true` is enabled in development only
- Entities use UUID primary keys (`@PrimaryGeneratedColumn('uuid')`)
- All entities have `createdAt` and `updatedAt` timestamps
- All user-owned resources have a `userId` foreign key for scoping

---

## Git Flow

This project follows the [git-flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model.

### Install git-flow

**macOS (Homebrew)**
```bash
brew install git-flow-avh
```

**Linux (Debian/Ubuntu)**
```bash
sudo apt-get install git-flow
```

**Windows (Git for Windows)**

git-flow is bundled with [Git for Windows](https://gitforwindows.org/). No extra installation needed.

### Initialize in your repo

Run once after cloning:

```bash
git flow init
```

Accept the defaults (or customise branch names). This sets up:
- `main` — production-ready code
- `develop` — integration branch for features

### Everyday workflow

**Start a feature**
```bash
git flow feature start <name>
# e.g. git flow feature start add-company-logo
```

**Finish a feature** (merges into `develop`, deletes the feature branch)
```bash
git flow feature finish <name>
```

**Start a release**
```bash
git flow release start <version>
# e.g. git flow release start 1.1.0
```

**Finish a release** (merges into `main` and `develop`, creates a tag)
```bash
git flow release finish <version>
```

**Start a hotfix** (branches off `main`)
```bash
git flow hotfix start <name>
git flow hotfix finish <name>
```

### Branch naming convention

| Prefix      | Purpose                            |
|-------------|------------------------------------|
| `feature/*` | New features or enhancements       |
| `release/*` | Release preparation                |
| `hotfix/*`  | Urgent production fixes            |
| `bugfix/*`  | Non-urgent bug fixes on `develop`  |

---

## Environment Setup

1. Copy `.env.example` to `backend/.env`
2. Create a PostgreSQL database named `applytracker`
3. Install dependencies in both `backend/` and `frontend/`
4. Start the backend first, then the frontend

See `README.md` for full setup instructions.

