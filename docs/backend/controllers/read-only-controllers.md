# ApplyTracker Backend – Read-only Controllers

## Objectif

Cette étape du backend ApplyTracker a pour objectif d’exposer les services read-only existants via des endpoints HTTP NestJS.

Les controllers doivent rester :

- simples
- fins (thin controllers)
- sans logique métier
- sans accès direct à la base de données

Le rôle du controller est uniquement :

```txt
HTTP → Service
```

---

# Architecture cible

## Flow général

```txt
HTTP Request
  → Controller
    → Service
      → Repository / TypeORM
        → Database
```

---

# Responsabilités

## Controller

Le controller représente la couche HTTP.

Il doit :

- exposer les routes HTTP
- récupérer les paramètres de requête
- appeler le service
- retourner le résultat du service

Il ne doit PAS :

- accéder à la DB
- connaître TypeORM
- contenir de logique métier
- contenir de règles métier

---

## Service

Le service contient la logique applicative et métier.

Le controller délègue systématiquement au service.

---

# Exemple de controller read-only

```ts
import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApplicationsService } from "./applications.service";

@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }
}
```

---

# Comprendre les décorateurs Nest

## @Controller('applications')

Déclare le préfixe HTTP du controller.

```txt
applications
```

Le controller expose donc :

```txt
GET /applications
GET /applications/:id
```

---

## @Get()

Déclare une route HTTP GET.

```ts
@Get()
```

équivaut à :

```txt
GET /applications
```

---

## @Get(':id')

Déclare une route contenant un paramètre dynamique.

```txt
GET /applications/:id
```

Exemple :

```txt
GET /applications/42
```

---

## @Param('id')

Récupère le paramètre HTTP depuis l’URL.

```ts
@Param('id')
```

équivaut mentalement à :

```txt
req.params.id
```

avec Express.

---

## ParseIntPipe

Les paramètres HTTP sont reçus sous forme de string.

```txt
"42"
```

`ParseIntPipe` transforme et valide automatiquement :

```txt
"42" → 42
```

Si la valeur est invalide :

```txt
GET /applications/abc
```

Nest retourne automatiquement :

```txt
400 Bad Request
```

---

# Injection de dépendances (DI)

## Constructor injection

```ts
constructor(
  private readonly applicationsService: ApplicationsService,
) {}
```

Le controller ne crée PAS le service.

Le constructor exprime uniquement une dépendance nécessaire.

Le module déclare les providers disponibles.

Puis, au bootstrap, le container DI Nest instancie et injecte automatiquement les dépendances nécessaires.

---

# Modules Nest et providers

Les services injectables sont déclarés dans les modules Nest.

Exemple :

```ts
@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
```

Le tableau :

```ts
providers: [];
```

contient les dépendances injectables gérées par Nest.

Exemples possibles :

- services
- guards
- strategies JWT
- helpers injectables
- repositories custom

---

# Tests unitaires des controllers

## Objectif

Les tests controller vérifient uniquement :

```txt
Controller → Service
```

Ils ne testent PAS :

- la DB
- TypeORM
- les relations
- le vrai HTTP

---

# Principe de test

Le service est mocké.

Le controller réel est instancié par Nest dans un mini environnement de test.

---

# Comprendre Test.createTestingModule()

`Test.createTestingModule()` crée un mini environnement NestJS.

Il reproduit :

- le container DI
- l’injection de dépendances
- l’instanciation des controllers

sans démarrer toute l’application.

---

# Comprendre les mocks Jest

## mockResolvedValue()

```ts
service.findOne.mockResolvedValue(result);
```

Configure le mock.

Cela signifie :

```txt
Quand findOne sera appelé,
retourner Promise.resolve(result)
```

---

# Pattern mental des tests

```txt
MOCK → CALL → CHECK
```

ou encore :

```txt
Arrange → Act → Assert
```

---

# Exemple complet

```ts
it("should return application from service", async () => {
  const id = 1;
  const result = { id };

  // MOCK
  service.findOne.mockResolvedValue(result);

  // CALL
  const response = await controller.findOne(id);

  // CHECK
  expect(response).toEqual(result);
  expect(service.findOne).toHaveBeenCalledTimes(1);
  expect(service.findOne).toHaveBeenCalledWith(id);
});
```

---

# Comprendre les assertions Jest

## toEqual(result)

Vérifie le résultat retourné.

---

## toHaveBeenCalledTimes(1)

Vérifie que le service a été appelé une seule fois.

---

## toHaveBeenCalledWith(id)

Vérifie que le controller a bien transmis le bon paramètre au service.

---

# Important : tests unitaires vs e2e

Les tests unitaires controller ne testent PAS :

```txt
@Get(':id')
```

ou le vrai routing HTTP.

Ils testent uniquement :

```txt
controller → service
```

Les tests e2e vérifieront plus tard :

```txt
GET /applications/:id
```

réellement.

---

# Principes architecturaux retenus

## SOLID

### S — Single Responsibility Principle

- controller = HTTP
- service = logique métier/applicative
- module = organisation du domaine

---

## DRY

Les controllers read-only suivent tous le même pattern.

Objectif :

- cohérence
- maintenabilité
- onboarding facilité

---

# Vision NestJS retenue

NestJS organise l’application par domaines métier.

Exemple :

```txt
applications/
companies/
statuses/
tags/
```

Chaque domaine contient ses propres :

- controllers
- services
- entities
- DTOs
- guards
- tests

---

# Objectif final de cette étape

Disposer d’une couche HTTP read-only homogène, testée et idiomatique NestJS, prête à être raccordée aux modules métier et à AppModule.
