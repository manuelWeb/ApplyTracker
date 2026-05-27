# NestJS injection de dépendances, les guards et le runtime

Cette documentation a pour objectif de rendre les mécanismes internes de NestJS plus naturels et moins “magiques”.

---

## 1. Classe vs objet runtime

Quand on écrit :

```ts
class AuthService {}
```

on ne crée PAS encore un objet.

On décrit seulement :

- une structure ;
- des méthodes ;
- un plan de construction.

On peut voir cela comme :

```txt
“la recette”
```

Mais rien n’existe encore réellement en mémoire.

---

Quand quelqu’un fait :

```ts
const authService = new AuthService();
```

alors :

- un vrai objet est créé ;
- il existe réellement en mémoire ;
- ses méthodes peuvent être appelées.

Exemple :

```ts
authService.login();
```

On parle alors :

- d’instance ;
- ou d’objet runtime.

---

## 2. Le runtime

Le runtime est simplement :

```txt
Le moment où le programme tourne réellement.
```

Exemple :

```txt
- requête HTTP reçue ;
- méthode exécutée ;
- objet créé ;
- appel à PostgreSQL ;
- JWT généré.
```

---

## 3. Le rôle du container NestJS

NestJS possède un système interne appelé :

```txt
container d’injection de dépendances
```

Son rôle :

```txt
- connaître les classes importantes ;
- savoir comment les créer ;
- savoir lesquelles dépendent des autres ;
- fournir les bonnes instances au bon moment.
```

---

## 4. Provider

Un provider est simplement :

```txt
Une classe que Nest sait créer et gérer.
```

Exemples :

```txt
AuthService
UsersService
JwtStrategy
Repository<User>
ConfigService
```

---

## 5. Constructor injection

Exemple :

```ts
constructor(
  private readonly authService: AuthService,
) {}
```

Cela signifie :

```txt
Cette classe a besoin d’un AuthService pour fonctionner.
```

NestJS va alors :

- créer/récupérer une instance runtime de `AuthService` ;
- la donner au constructor.

Conceptuellement :

```ts
const authService = new AuthService(...);

const controller =
  new AuthController(authService);
```

---

## 6. `private readonly`

Quand on écrit :

```ts
private readonly authService: AuthService
```

cela combine plusieurs choses.

---

### `private`

Accessible uniquement dans la classe.

Donc :

```ts
this.authService;
```

fonctionne dans le controller.

Mais :

```ts
controller.authService;
```

est interdit depuis l’extérieur.

---

### `readonly`

Une fois la dépendance assignée dans le constructor :

```ts
this.authService = ...
```

on ne peut plus remplacer la référence.

Interdit :

```ts
this.authService = anotherService;
```

Mais on peut toujours utiliser les méthodes :

```ts
this.authService.login(dto);
```

---

## 7. Route handler

Dans NestJS, un handler est simplement :

```txt
La méthode qui traite une route HTTP.
```

Exemple :

```ts
@Get('me')
me() {}
```

Le handler est :

```txt
AuthController.me
```

---

## 8. Décorateurs et metadata

Quand on écrit :

```ts
@Get('me')
```

NestJS attache des informations à la méthode.

Informations attachées :

```txt
- méthode HTTP = GET
- route = "me"
```

Ces informations s’appellent :

```txt
metadata
```

---

## 9. `@UseGuards(JwtAuthGuard)`

Quand on écrit :

```ts
@UseGuards(JwtAuthGuard)
```

NestJS attache une metadata du type :

```txt
guards = [JwtAuthGuard]
```

Cela signifie simplement :

```txt
Avant d’exécuter ce handler,
il faudra utiliser JwtAuthGuard.
```

---

## 10. Ce que fait réellement NestJS

Quand une requête arrive :

```http
GET /auth/me
```

NestJS :

1. trouve le handler ;
2. lit les metadata ;
3. demande au container une instance runtime du guard ;
4. exécute le guard ;
5. exécute ensuite le handler si autorisé.

---

## 11. Guard vs dépendance injectée

### Constructor injection

```ts
constructor(
  private readonly authService: AuthService,
) {}
```

signifie :

```txt
Le controller dépend directement de AuthService.
```

---

### `@UseGuards(...)`

signifie :

```txt
Cette route doit être protégée.
```

Le guard fait partie du pipeline HTTP.

---

## 12. Relation Guard / Strategy

```txt
Strategy = comment authentifier
Guard    = quand utiliser cette authentification
```

Flow simplifié :

```txt
requête HTTP
→ JwtAuthGuard
→ Passport
→ JwtStrategy
→ request.user
→ controller
```
