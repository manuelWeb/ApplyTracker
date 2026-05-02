# NestJS + TypeORM — Defining Entities

## Goal

This document explains how to define TypeORM entities in a clean and scalable NestJS architecture.

---

# Core Vocabulary

## Entity

A TypeORM entity is a TypeScript class mapped to a SQL table.

```text
TypeScript class
↕
TypeORM decorators
↕
SQL table
```

Example:

```text
class User
↕
table users
```

---

## DTO — Data Transfer Object

A DTO defines the shape of data exchanged through the API.

Example:

```text
CreateUserDto
```

DTOs are NOT database entities.

```text
Entity = database structure
DTO = API payload structure
```

---

# Recommended Architecture

## Module Structure

```text
src/
└── users/
    ├── entities/
    │   └── user.entity.ts
    ├── users.module.ts
    ├── users.service.ts
    └── users.controller.ts
```

---

# Naming Conventions

## Database

Use snake_case.

Example:

```text
user_id
password_hash
created_at
```

---

## TypeScript Properties

Use camelCase.

Example:

```ts
userId
passwordHash
createdAt
```

---

## Files

Use kebab-case.

Example:

```text
email-template.entity.ts
```

---

## Classes

Use PascalCase.

Example:

```ts
EmailTemplate
```

---

# Defining an Entity

## Basic Example

```ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  userId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  passwordHash!: string;
}
```

---

# Important Concepts

## @Entity()

Maps the class to a SQL table.

```ts
@Entity('users')
```

---

## @Column()

Maps a property to a SQL column.

```ts
@Column({
  type: 'varchar',
  length: 255,
})
```

---

## @PrimaryGeneratedColumn()

Creates:

```text
PRIMARY KEY
NOT NULL
AUTO INCREMENT
```

---

# snake_case vs camelCase

Good practice:

```text
Database → snake_case
TypeScript → camelCase
```

Example:

```ts
@Column({
  name: 'password_hash',
})
passwordHash!: string;
```

---

# nullable

## Required column

```ts
nullable: false
```

## Optional column

```ts
nullable: true
```

Example:

```ts
@Column({
  nullable: true,
})
website?: string;
```

---

# Relation Types

## Many-to-One

Example:

```text
Many applications → one user
```

TypeORM:

```ts
@ManyToOne(() => User, {
  nullable: false,
})
@JoinColumn({
  name: 'user_id',
})
user!: User;
```

---

## Mental Model

```text
@ManyToOne
= relation definition

@JoinColumn
= SQL foreign key column
```

---

# Many-to-Many

Example:

```text
applications ↔ tags
```

TypeORM:

```ts
@ManyToMany(() => Tag, (tag) => tag.applications)
@JoinTable({
  name: 'application_tag',
  joinColumn: {
    name: 'application_id',
    referencedColumnName: 'applicationId',
  },
  inverseJoinColumn: {
    name: 'tag_id',
    referencedColumnName: 'tagId',
  },
})
tags!: Tag[];
```

Inverse side:

```ts
@ManyToMany(() => Application, (application) => application.tags)
applications!: Application[];
```

---

# Important Rule

`@JoinTable()` appears only on the owner side.

---

# joinColumn vs inverseJoinColumn

## joinColumn

Points to the owner entity.

```text
application_id → Application.applicationId
```

## inverseJoinColumn

Points to the target entity.

```text
tag_id → Tag.tagId
```

---

# Bidirectional Relations

Good practice:

```text
Application.tags ↔ Tag.applications
```

Use inverse side definitions:

```ts
@ManyToMany(() => Tag, (tag) => tag.applications)
```

---

# Entity Categories

## Foundational Entities

Independent entities without outgoing foreign keys.

Examples:

```text
users
statuses
contracts
tags
companies
```

---

## Business Entities

Core business entities depending on foundational entities.

Examples:

```text
applications
documents
contacts
email_templates
```

---

## Historical Entities

Entities representing history or events.

Examples:

```text
events
comments
```

---

# Tip — How to Recognize Historical Entities

Ask yourself:

```text
Does this entity represent:
- a current business state
OR
- something that happened in time?
```

Historical entities often contain:

```text
occurred_at
created_at
event_type
```

---

# Recommended Workflow

```text
1. Define foundational entities
2. Define business entities
3. Define historical entities
4. Define many-to-many relations
5. Review entities
6. Generate migrations
7. Run migrations
8. Create seeds
9. Define DTOs
10. Create services/controllers
```

---

# Important Rule

Keep:

```ts
synchronize: false
```

Use migrations instead of automatic synchronization.
