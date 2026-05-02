# NestJS + TypeORM — Migrations Setup

## Goal

This document explains how to configure and use TypeORM migrations in the ApplyTracker backend.

---

# Why use migrations?

A migration is a versioned file describing how the database schema evolves over time.

```text
TypeORM entities
→ migration generation
→ migration review
→ migration execution
→ database schema update
```

Keep this setting:

```ts
synchronize: false
```

This avoids automatic schema changes without history tracking.

---

# NestJS runtime vs TypeORM CLI

There are two different runtimes involved.

## NestJS runtime

The NestJS application uses:

```text
src/config/typeorm.config.ts
```

through:

```ts
TypeOrmModule.forRoot(typeOrmConfig)
```

This configuration is used when the API starts.

---

## TypeORM CLI runtime

The TypeORM CLI does not start NestJS.

It needs its own configuration file:

```text
src/config/typeorm.datasource.ts
```

This file exports a `DataSource` used by the CLI to:

- connect to PostgreSQL;
- scan entities;
- generate migrations;
- run migrations.

---

# Recommended structure

```text
src/
├── config/
│   ├── typeorm.config.ts
│   └── typeorm.datasource.ts
├── migrations/
└── ...
```

---

# Loading the root `.env`

In this project, the `.env` file is stored at the repository root to avoid duplicating database configuration.

Since commands are executed from `backend/`, the DataSource must explicitly load the parent `.env`.

```ts
import * as dotenv from 'dotenv';

dotenv.config({
  path: '../.env',
});
```

---

# Docker networking

Always think about where the connection comes from.

## From a Docker container

The NestJS API connects through the Docker service name:

```text
host = db
port = 5432
```

---

## From the local machine

The TypeORM CLI connects through the published host port:

```text
host = localhost
port = POSTGRES_HOST_PORT
```

Example:

```text
localhost:5450
```

The CLI DataSource should therefore use:

```ts
host: 'localhost',
port: Number(process.env.POSTGRES_HOST_PORT),
```

---

# `psql -h localhost`

This works:

```bash
psql -h localhost -p 5450 -U applytracker -d applytracker
```

Without `-h localhost`, `psql` may try to connect through a local Unix socket instead of TCP.

---

# Using absolute imports with TypeORM CLI

NestJS projects often use absolute imports:

```ts
import { Application } from 'src/applications/entities/application.entity';
```

To make these imports work with the TypeORM CLI, install:

```bash
npm install -D tsconfig-paths
```

Then update the TypeORM script:

```json
{
  "scripts": {
    "typeorm": "node -r ts-node/register -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
  }
}
```

This allows Node.js to resolve imports such as:

```text
src/*
```

when running migrations.

---

# Migration scripts

Recommended scripts inside `backend/package.json`:

```json
{
  "scripts": {
    "typeorm": "node -r ts-node/register -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm -- migration:generate src/migrations/InitSchema -d src/config/typeorm.datasource.ts",
    "migration:run": "npm run typeorm -- migration:run -d src/config/typeorm.datasource.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/config/typeorm.datasource.ts"
  }
}
```

---

# Generating a migration

Run:

```bash
npm run migration:generate
```

TypeORM will:

```text
1. load the DataSource
2. connect to PostgreSQL
3. scan entities
4. compare entities with the current schema
5. generate a migration file
```

Example:

```text
src/migrations/<timestamp>-InitSchema.ts
```

---

# Review the migration before running it

Before executing the migration, check:

- `up()` exists;
- `down()` exists;
- expected tables are created;
- foreign keys are present;
- unique constraints are present;
- pivot tables are generated correctly.

---

# Running migrations

Run:

```bash
npm run migration:run
```

TypeORM automatically creates a technical table:

```text
migrations
```

This table stores executed migrations.

---

# Checking database tables

Connect to PostgreSQL:

```bash
psql -h localhost -p 5450 -U applytracker -d applytracker
```

List tables:

```sql
\dt
```

Check executed migrations:

```sql
SELECT * FROM migrations;
```

---

# Common tips

## Local machine vs Docker container

From the local machine:

```text
localhost:POSTGRES_HOST_PORT
```

From a container:

```text
db:POSTGRES_CONTAINER_PORT
```

Keep these two contexts separate.

---

## Migrations folder name

Make sure the directory name matches the DataSource configuration:

```text
src/migrations/
```

---

## Absolute imports

If the TypeORM CLI cannot resolve:

```text
src/...
```

check that:

```text
-r tsconfig-paths/register
```

is present in the TypeORM script.

---

# Recommended commits

Initial schema migration:

```bash
git add backend/src/migrations/<timestamp>-InitSchema.ts
git commit -m "core(be): add initial TypeORM schema migration"
```

Migration documentation:

```bash
git add docs/typeorm-migrations-workflow.md
git commit -m "docs(be): document TypeORM migrations workflow"
```
