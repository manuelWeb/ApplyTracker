# Backend DTOs & Validation — ApplyTracker

## Contexte

Cette branche :

```txt
feature/backend-dtos-validation
```

a pour objectif d’introduire le socle de validation et les premiers contrats API du backend ApplyTracker avant l’implémentation de l’authentification applicative et des futures mutations métier sécurisées.

Architecture actuelle :

```txt
Controller = couche HTTP
Service    = logique applicative / métier
TypeORM    = persistance
DTO        = contrat API
```

---

# 1. Mise en place de Swagger/OpenAPI

## Installation

Conformément à la documentation officielle NestJS :

```bash
npm install @nestjs/swagger
```

Documentation officielle :

https://docs.nestjs.com/openapi/introduction

## Configuration dans `main.ts`

`main.ts` est le point d’entrée principal de l’application NestJS.

Swagger est configuré avant `app.listen()`.

Exemple :

```ts
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("ApplyTracker API")
    .setDescription("ApplyTracker backend API documentation")
    .setVersion("0.0.1")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

## Comprendre `DocumentBuilder`

`DocumentBuilder` prépare les métadonnées générales du document OpenAPI :

```txt
- titre
- description
- version
```

Il ne génère pas encore le document Swagger complet.

## Comprendre `createDocument()`

```ts
SwaggerModule.createDocument(app, config);
```

Cette méthode analyse l’application NestJS :

```txt
- controllers
- routes
- decorators
- DTOs
```

afin de produire un document OpenAPI.

## Comprendre `documentFactory`

La documentation officielle utilise :

```ts
const documentFactory = () => SwaggerModule.createDocument(app, config);
```

Il s’agit simplement d’une fonction capable de générer le document Swagger à la demande.

```txt
document        = document déjà généré
documentFactory = fonction capable de le générer
```

## Comprendre `SwaggerModule.setup()`

```ts
SwaggerModule.setup("api", app, documentFactory);
```

Arguments :

```txt
'api'             → route exposant Swagger UI
app               → instance NestJS
documentFactory   → fonction générant le document OpenAPI
```

Swagger UI devient alors accessible via :

```txt
http://localhost:3000/api
```

---

# 2. Mise en place du ValidationPipe global

## Installation

```bash
npm install class-validator class-transformer
```

## Rôle des packages

### `class-validator`

Permet de déclarer les règles de validation des DTOs :

```ts
@IsString()
@IsInt()
@IsOptional()
```

### `class-transformer`

Permet de transformer les payloads HTTP en instances de classes TypeScript.

Exemple :

```json
{
  "jobTitle": "Backend Developer"
}
```

devient :

```ts
CreateApplicationDto {
  jobTitle: 'Backend Developer'
}
```

## Configuration dans `main.ts`

```ts
import { ValidationPipe } from "@nestjs/common";

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

## Comprendre les options

### `whitelist: true`

Supprime les propriétés non présentes dans le DTO.

### `forbidNonWhitelisted: true`

Retourne une erreur `400 Bad Request` si des propriétés inconnues sont envoyées.

### `transform: true`

Transforme automatiquement certains types :

```txt
"42" → 42
```

et convertit les payloads en instances de DTOs.

---

# 3. Introduction des DTOs Applications

## Objectif

Définir les premiers contrats d’entrée HTTP du domaine Applications.

DTOs introduits :

```txt
CreateApplicationDto
UpdateApplicationDto
```

## Structure

```txt
src/applications/dto/
```

---

# 4. CreateApplicationDto

## Rôle

Décrire les données nécessaires à la création d’une candidature.

## Important

Un DTO ne doit PAS recopier aveuglément l’entity TypeORM.

Différence fondamentale :

```txt
Entity = modèle de persistance
DTO    = contrat API
```

Exemple :

```ts
company!: Company;
```

devient côté DTO :

```ts
companyId!: number;
```

## Important — DTO et contexte utilisateur

Les DTOs décrivent uniquement les données fournies par le client HTTP.

Ils ne doivent pas transporter l’identité de l’utilisateur courant.

Ainsi, une future création de candidature ne devra pas recevoir un `userId` dans le payload HTTP.

Le backend devra récupérer cette information depuis le contexte d’authentification, par exemple via un JWT, un guard et un `currentUser`.

Exemple à éviter :

```json
{
  "userId": 42,
  "jobTitle": "Backend Developer"
}
```

Le futur flux attendu sera plutôt :

```txt
JWT → current user → service → création de l’Application
```

Cette séparation évite de faire confiance à une donnée sensible envoyée par le client.

## Relations ManyToOne

Les relations obligatoires :

```txt
Company
Contract
Status
```

sont représentées dans le DTO par :

```txt
companyId
contractId
statusId
```

## Pourquoi pas les ManyToMany ?

Les relations :

```txt
tags
documents
```

n’ont pas été incluses dans les DTOs initiaux car :

```txt
- elles passent par des tables de jointure
- elles sont secondaires
- elles peuvent être gérées plus tard via des endpoints dédiés
```

---

# 5. UpdateApplicationDto

## Différence avec Create DTO

Le `PATCH` représente une modification partielle.

Donc :

```txt
- Create DTO → certains champs obligatoires
- Update DTO → champs modifiables optionnels
```

## Important : `@IsOptional()`

`@IsOptional()` signifie :

```txt
Le champ peut être absent du payload.
```

Cela ne signifie PAS :

```txt
Le champ peut contenir n’importe quoi.
```

## Exemple correct

```ts
@IsOptional()
@IsString()
@IsNotEmpty()
jobTitle?: string;
```

Logique :

```txt
- champ absent → OK
- champ présent → doit être valide
```

---

# 6. Pièges importants identifiés

## Piège 1 — DTO ≠ Entity

Ne jamais exposer directement une entity TypeORM dans `@Body()`.

Mauvais :

```ts
create(@Body() application: Application)
```

Correct :

```ts
create(@Body() dto: CreateApplicationDto)
```

---

## Piège 2 — `@IsOptional()` et `null`

`@IsOptional()` ignore :

```txt
undefined
null
```

Donc :

```json
{
  "statusId": null
}
```

peut bypass certains validators.

Pour cette première version :

```ts
@IsOptional()
@IsInt()
@IsPositive()
statusId?: number;
```

reste acceptable.

Le merge PATCH devra être sécurisé côté service.

---

## Piège 3 — PATCH ≠ PUT

Un `PATCH` ne doit pas imposer tous les champs.

```txt
champ absent → ne pas modifier
champ présent → valider
```

---

## Piège 4 — Champs optionnels métier

Les champs éditoriaux optionnels :

```txt
location
jobDescription
projectGoal
```

peuvent accepter `""` si cela représente un effacement volontaire de contenu.

En revanche :

```txt
jobTitle
```

ne doit jamais devenir vide.

---

## Piège 5 — Ne pas confondre contrat HTTP et ownership métier

Le DTO décrit les données acceptées dans le payload.

Il ne suffit pas à garantir qu’un utilisateur a le droit de créer, lire ou modifier une ressource.

Les futures routes métier devront donc combiner :

```txt
DTO validé
+ current user authentifié
+ vérification d’ownership côté service
```

Exemple futur attendu :

```ts
create(currentUserId: number, dto: CreateApplicationDto)
```

plutôt que :

```ts
create(dto: CreateApplicationDto)
```

si la candidature appartient à l’utilisateur courant.

---

# 7. Next step

Les DTOs `CreateApplicationDto` et `UpdateApplicationDto` définissent désormais les premiers contrats d’entrée du domaine Applications.

La prochaine étape logique consiste à introduire le contexte utilisateur et les mécanismes d’authentification nécessaires aux futures mutations métier sécurisées.

L’objectif sera notamment de :

```txt
- créer un utilisateur de manière contrôlée
- authentifier cet utilisateur
- récupérer le current user depuis le contexte HTTP
- éviter l’exposition d’un userId dans les payloads
- préparer les futures vérifications d’ownership
- sécuriser les futures routes write
```

Cette étape préparera ensuite l’intégration des futures routes d’écriture Applications (`POST`, `PATCH`) dans une architecture cohérente et sécurisée.
