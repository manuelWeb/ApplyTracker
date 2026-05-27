# Auth Context NestJS/JWT

Documentation `feature/backend-auth-context`.

Cette documentation reprend l’ensemble auth. La préparation du service utilisateur jusqu’au test e2e :

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

Objectif de la branche :

```txt
Permettre au backend d’identifier le current authenticated user
afin que les futures routes métier puissent appliquer l’ownership.
```

## 1. Vue d’ensemble du flow auth

Le flow final est :

```txt
register
→ crée un utilisateur

login
→ valide les credentials
→ génère un JWT
→ pose un cookie httpOnly access_token

me
→ lit le cookie
→ vérifie le JWT via Passport
→ reconstruit request.user
→ retourne le current user
```

Le point important :

```txt
Le userId ne doit jamais venir du payload client.
Il doit venir du JWT validé côté backend.
```

## 2. Préparation de UsersService

Le service utilisateur expose les méthodes nécessaires aux flows auth :

```txt
UsersService.create(email, passwordHash)
UsersService.findByEmail(email)
UsersService.findOne(userId)
```

Dans ApplyTracker, l’identifiant utilisateur est :

```ts
userId: number;
```

et non :

```ts
id;
```

Donc le payload JWT doit s’aligner sur le modèle réel :

```ts
{
  sub: currentUser.userId,
  email: currentUser.email,
}
```

## 3. AuthModule et AuthService

Le module auth centralise :

- register
- login
- JWT
- Passport
- Strategy
- Guard

`AuthService` porte la logique métier d’authentification.

`AuthController` porte la logique HTTP :

- lire le body
- poser un cookie
- retourner une réponse HTTP

Décision d’architecture retenue :

```txt
Le service génère le token.
Le controller décide comment le transporter HTTP.
```

Donc :

```txt
AuthService → crée accessToken
AuthController → écrit access_token en cookie httpOnly
```

## 4. Register

Endpoint :

```http
POST /auth/register
```

Responsabilité :

```txt
Créer un utilisateur avec password hashé.
```

Le password reçu depuis `RegisterDto` est hashé via bcrypt avant persistance.

Retour attendu :

```json
{
  "userId": 1,
  "email": "user@example.com"
}
```

Invariant de sécurité :

```txt
passwordHash ne doit jamais sortir dans la réponse HTTP.
```

## 5. Login

Endpoint :

```http
POST /auth/login
```

Responsabilité :

```txt
Valider les credentials et créer le contexte d’authentification.
```

Le service :

1. cherche l’utilisateur par email ;
2. compare le password avec `bcrypt.compare(...)` ;
3. génère un JWT ;
4. retourne un safe user + accessToken interne.

Les erreurs de login doivent rester génériques :

```ts
throw new UnauthorizedException("Invalid credentials");
```

Pourquoi ?

```txt
Ne pas révéler si l’email existe ou si seul le mot de passe est faux.
```

## 6. EntityNotFoundError

Quand `findByEmail(...)` utilise `findOneOrFail(...)`, TypeORM peut lever :

```ts
EntityNotFoundError;
```

Dans le contexte auth, cette erreur technique est traduite en :

```ts
UnauthorizedException("Invalid credentials");
```

Point important :

```txt
L’auth ne doit pas exposer les détails internes de la DB.
```

## 7. JWT infrastructure

`JwtModule.register(...)` configure l’infrastructure JWT.

Le rôle de `JwtService` :

```txt
Signer un payload applicatif pour produire un JWT.
```

Payload retenu :

```ts
{
  sub: currentUser.userId,
  email: currentUser.email,
}
```

`sub` signifie :

```txt
subject
```

C’est la convention JWT pour l’identité principale représentée par le token.

## 8. Signature vs secret JWT

Un JWT est composé de trois parties :

```txt
HEADER.PAYLOAD.SIGNATURE
```

Le `JWT_SECRET` n’est pas la signature.

Il sert à produire et vérifier la signature.

Mental model :

```txt
JWT_SECRET = tampon secret
signature  = cachet produit avec le tampon
```

La signature permet de vérifier que :

```txt
le payload n’a pas été modifié
```

## 9. Cookie httpOnly

Après login, le controller pose :

```ts
res.cookie("access_token", accessToken, {
  httpOnly: true,
});
```

Pourquoi `httpOnly` ?

```txt
Le frontend ne peut pas lire le token en JavaScript.
Cela limite l’exposition en cas de XSS.
```

Le login retourne uniquement le safe user dans le body.

Le token ne doit pas apparaître dans la réponse JSON finale.

## 10. `@Res({ passthrough: true })`

Dans NestJS, utiliser `@Res()` seul court-circuite le système de réponse automatique de Nest.

Avec :

```ts
@Res({ passthrough: true })
```

on peut :

```txt
- écrire le cookie via res.cookie(...)
- continuer à retourner un body normalement avec return user
```

Flow :

```txt
res.cookie(...) → ajoute Set-Cookie
return user     → Nest sérialise le body JSON
```

## 11. Status code du login

NestJS applique par défaut :

```txt
@Post() → 201 Created
```

Mais `login` ne crée pas de ressource métier.

Le status code sémantiquement correct est :

```http
200 OK
```

Correction :

```ts
@HttpCode(HttpStatus.OK)
@Post('login')
```

## 12. cookie-parser

`cookie-parser` transforme le header HTTP :

```http
Cookie: access_token=...
```

en :

```ts
request.cookies.access_token;
```

Sans `cookie-parser`, `JwtStrategy` ne peut pas lire simplement le cookie.

Il est configuré globalement dans `main.ts`.

Important e2e :

```txt
main.ts n’est pas exécuté dans les tests e2e.
```

Donc le bootstrap e2e doit aussi appeler :

```ts
app.use(cookieParser());
```

## 13. Passport infrastructure

Packages utilisés :

```txt
@nestjs/passport
passport
passport-jwt
@types/passport-jwt
```

Rôle des pièces :

```txt
passport         → librairie auth générique Node.js
passport-jwt     → stratégie JWT pour Passport
@nestjs/passport → intégration NestJS de Passport
```

`PassportModule.register({ defaultStrategy: 'jwt' })` indique que la stratégie par défaut est `jwt`.

## 14. JwtStrategy

Fichier :

```txt
src/auth/strategies/jwt.strategy.ts
```

Responsabilité :

```txt
Expliquer à Passport comment extraire et valider un JWT.
```

La classe ressemble conceptuellement à :

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ...,
      secretOrKey: ...,
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
```

## 15. Pourquoi `extends PassportStrategy(Strategy)` ?

Cette ligne :

```ts
extends PassportStrategy(Strategy)
```

signifie conceptuellement :

```ts
const NestJwtStrategyBase = PassportStrategy(Strategy);

export class JwtStrategy extends NestJwtStrategyBase {}
```

`Strategy` vient de :

```ts
passport - jwt;
```

et contient la logique JWT réelle.

`PassportStrategy(...)` vient de :

```ts
@nestjs/passport
```

et adapte cette stratégie au container NestJS.

Mental model :

```txt
Strategy = stratégie Passport JWT brute
PassportStrategy(Strategy) = version compatible Nest
JwtStrategy = stratégie applicative ApplyTracker
```

## 16. Extraction TS-safe du cookie

Le cookie est extrait avec une fonction custom :

```ts
(request: Request): string | null => {
  const cookiesUnknown: unknown = (request as { cookies?: unknown }).cookies;

  if (!cookiesUnknown || typeof cookiesUnknown !== "object") {
    return null;
  }

  const token = (cookiesUnknown as Record<string, unknown>).access_token;

  if (typeof token !== "string") {
    return null;
  }

  return token;
};
```

Pourquoi cette forme ?

Parce que `Request` Express ne connaît pas toujours proprement `cookies`.

On part donc de :

```ts
unknown;
```

puis on vérifie progressivement :

```txt
cookies existe
cookies est un object
access_token existe
access_token est une string
```

C’est plus safe que `any`.

## 17. `validate(payload)` ne valide pas cryptographiquement le JWT

Point très important :

```txt
Quand validate(payload) est appelé,
Passport a déjà vérifié le token.
```

Passport JWT a déjà vérifié :

```txt
- présence du token
- signature
- expiration
- secret
```

`validate(payload)` sert à transformer le payload JWT en auth context applicatif :

```ts
{
  userId: payload.sub,
  email: payload.email,
}
```

Ce retour devient ensuite :

```ts
request.user;
```

## 18. Provider JwtStrategy dans AuthModule

`JwtStrategy` doit être ajouté aux providers du `AuthModule` :

```ts
providers: [AuthService, JwtStrategy];
```

Cela ne signifie pas que `JwtStrategy` est injectée dans `AuthService`.

Cela signifie :

```txt
Nest doit instancier JwtStrategy au démarrage
afin que Passport connaisse la stratégie jwt.
```

Différence :

```txt
provider enregistré → Nest sait créer la classe
provider injecté    → une classe le reçoit dans son constructor
```

Injection réelle :

```ts
constructor(private readonly authService: AuthService) {}
```

## 19. JwtAuthGuard

Fichier :

```txt
src/auth/guards/jwt-auth.guard.ts
```

Contenu minimal :

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

Pourquoi cette classe est-elle si courte ?

Parce que :

```ts
AuthGuard("jwt");
```

est une factory fournie par `@nestjs/passport`.

Elle retourne une classe Guard déjà prête.

Mental model :

```ts
const BaseJwtGuard = AuthGuard("jwt");

export class JwtAuthGuard extends BaseJwtGuard {}
```

## 20. Relation entre Guard et Strategy

Très important :

```txt
Strategy = comment authentifier
Guard    = où appliquer l’authentification
```

`JwtStrategy` sait :

```txt
- lire le cookie
- vérifier le token
- produire request.user
```

`JwtAuthGuard` dit :

```txt
Cette route doit utiliser la stratégie jwt.
```

Flow :

```txt
request
→ JwtAuthGuard
→ Passport
→ JwtStrategy
→ validate(payload)
→ request.user
→ controller
```

Sans Guard, la Strategy existe mais n’est pas déclenchée sur une route.

## 21. Pourquoi JwtAuthGuard n’est pas forcément dans providers

Une strategy doit être enregistrée comme provider pour que Passport la connaisse.

Un guard utilisé directement ainsi :

```ts
@UseGuards(JwtAuthGuard)
```

peut être résolu par Nest au niveau de la route.

Il n’a pas besoin d’être listé dans `providers` tant qu’il n’a pas de dépendances injectées spécifiques.

## 22. Route protégée `/auth/me`

Endpoint :

```http
GET /auth/me
```

Controller :

```ts
@UseGuards(JwtAuthGuard)
@Get('me')
me(@Req() request: Request) {
  return request.user;
}
```

Rôle :

```txt
Restaurer le current authenticated user depuis le cookie JWT.
```

Cas frontend typique :

```txt
L’utilisateur recharge la page.
Le state frontend est perdu.
Le cookie httpOnly existe toujours.
Le frontend appelle /auth/me.
Le backend retourne le current user.
```

## 23. Typage de `request.user`

Passport augmente Express avec :

```ts
interface User {}

interface Request {
  user?: User | undefined;
}
```

Donc TypeScript accepte parfois :

```ts
request.user;
```

Mais `User` est vide.

Cela signifie :

```txt
TypeScript sait que request.user peut exister,
mais il ne connaît pas encore sa shape métier.
```

Pour l’instant, c’est acceptable.

Une étape future pourra introduire :

```ts
AuthenticatedUser;
```

ou un decorator :

```ts
@CurrentUser()
```

Mais ce n’était pas nécessaire dans cette branche.

## 24. Tests unitaires auth

Les tests unitaires déjà ajoutés couvrent notamment les scénarios invalides de login.

Philosophie retenue :

```txt
Le subject under test est réel.
Ses dépendances sont mockées.
```

Exemple :

```txt
AuthService réel
UsersService mocké
JwtService mocké
bcrypt mocké/spy selon besoin
```

Pattern important pour les erreurs async :

```ts
const promise = service.login(dto);

await expect(promise).rejects.toThrow(UnauthorizedException);
```

Ne pas faire :

```ts
await service.login(dto);
```

avant `expect`, sinon l’erreur est levée trop tôt, la promesse est consommée, et le test ne peut pas vérifier l’erreur.

## 25. Tests e2e

Les tests e2e ne testent pas les méthodes internes.

Ils testent le contrat HTTP réel :

```txt
HTTP request
→ pipes
→ guards
→ strategy
→ controller
→ service
→ database
→ HTTP response
```

Pour l’auth, c’est pertinent car si ce flow tombe :

```txt
toute l’API protégée tombe.
```

## 26. Pourquoi AppModule dans les e2e

Dans un e2e, on importe :

```ts
imports: [AppModule];
```

et non seulement `AuthModule`.

Pourquoi ?

Parce qu’on veut tester l’application réelle :

```txt
ConfigModule
TypeOrmModule
UsersModule
AuthModule
PassportModule
JwtModule
Repositories
```

`AppModule` représente le graphe applicatif réel.

## 27. Pourquoi pas main.ts

`main.ts` lance l’application runtime :

```txt
create app
configure middleware
listen port
```

En e2e, on ne veut pas écouter un port réel.

On crée une app en mémoire :

```ts
app = moduleFixture.createNestApplication();
```

puis Supertest appelle :

```ts
request(app.getHttpServer());
```

## 28. moduleFixture

`moduleFixture` est le module Nest compilé pour le test.

Il représente :

```txt
un container DI de test
```

On peut y récupérer des providers :

```ts
moduleFixture.get(...)
```

ou créer l’application :

```ts
moduleFixture.createNestApplication();
```

Mental model :

```txt
moduleFixture = container DI compilé
app = application HTTP construite à partir de ce container
```

## 29. Provider vs container

### Provider

```txt
Une chose injectable que Nest sait créer.
```

Exemples :

```txt
AuthService
UsersService
JwtStrategy
Repository<User>
ConfigService
```

### Container

```txt
Celui qui connaît les providers,
sait les créer,
et sait les injecter.
```

Mnémotechnique :

```txt
provider = la chose
container = celui qui gère les choses
```

## 30. Supertest

Supertest est une librairie Node.js de test HTTP.

Elle n’est pas spécifique à NestJS.

Elle permet de simuler un client HTTP :

```ts
await request(app.getHttpServer())
  .post("/auth/login")
  .send(credentials)
  .expect(200);
```

C’est un Postman programmatique dans les tests.

## 31. E2E Docker

Problème rencontré :

```txt
npm run test:e2e depuis le host
→ env Docker non injectées
→ PostgreSQL cherche database "Manuel"
```

Pourquoi ?

Parce que `docker-compose.yml` injecte :

```yaml
env_file:
  - .env
  - ./backend/.env
```

uniquement dans les conteneurs.

Lancer Jest sur le host ne bénéficie pas de cette injection.

Décision retenue :

```txt
Les e2e doivent tourner dans le conteneur api.
```

Scripts :

```json
{
  "test:e2e": "docker compose exec api npm run test:e2e:run",
  "test:e2e:run": "jest --config ./test/jest-e2e.json"
}
```

## 32. Jest e2e config

Le fichier :

```txt
test/jest-e2e.json
```

sert à configurer Jest pour les tests e2e.

Pain point rencontré :

```txt
Jest ne résout pas automatiquement les paths TS comme @/*
```

Correction via `moduleNameMapper`.

Exemple :

```json
"moduleNameMapper": {
  "^@/(.*)$": "<rootDir>/../src/$1",
  "^src/(.*)$": "<rootDir>/../src/$1"
}
```

## 33. app.close()

Sans teardown :

```txt
Jest did not exit one second after the test run has completed
```

Pourquoi ?

Nest/TypeORM gardent des handles ouverts :

```txt
HTTP server
PostgreSQL connection pool
```

Solution :

```ts
afterAll(async () => {
  await app.close();
});
```

## 34. getRepositoryToken vs new DataSource

En test Nest, préférer :

```ts
getRepositoryToken(User);
```

plutôt que :

```ts
new DataSource(...)
```

Pourquoi ?

```txt
getRepositoryToken récupère le repository géré par le container Nest.
new DataSource crée une connexion TypeORM séparée.
```

Principe :

```txt
Dans Nest, on récupère les dépendances depuis le container DI
au lieu de les instancier soi-même.
```

## 35. Test e2e register

Ce test vérifie :

```txt
POST /auth/register
→ 201
→ retourne safe user
→ ne retourne pas passwordHash
```

Invariants importants :

```txt
- userId présent
- email correct
- passwordHash absent
```

## 36. Test e2e login

Ce test vérifie :

```txt
register user
→ login
→ 200
→ retourne safe user
→ ne retourne pas accessToken dans le body
→ pose Set-Cookie access_token HttpOnly
```

Important HTTP :

```txt
Cookie     = client → serveur
Set-Cookie = serveur → client
```

Après login, on inspecte donc :

```ts
response.headers["set-cookie"];
```

## 37. Robustesse du cookie dans les tests

Ne pas supposer que `access_token` est toujours à l’index 0.

Préférer :

```ts
const cookies = response.headers["set-cookie"] as unknown as string[];

const accessTokenCookie = cookies.find((cookie) =>
  cookie.startsWith("access_token="),
);

expect(accessTokenCookie).toBeDefined();
expect(accessTokenCookie).toContain("HttpOnly");
```

Pourquoi ?

Demain l’API pourrait ajouter :

```txt
refresh_token
csrf_token
```

L’ordre des cookies ne doit pas rendre le test fragile.

## 38. Test e2e /auth/me

Flow :

```txt
ARRANGE
  register user
  login user
  récupérer cookie

ACT
  GET /auth/me avec Cookie header

ASSERT
  200
  current user correct
```

Exemple :

```ts
const loginResponse = await request(app.getHttpServer())
  .post("/auth/login")
  .send(credentials)
  .expect(200);

const cookies = loginResponse.headers["set-cookie"] as unknown as string[];

const response = await request(app.getHttpServer())
  .get("/auth/me")
  .set("Cookie", cookies)
  .expect(200);
```

Sans `.set('Cookie', cookies)`, Supertest ne réinjecte pas automatiquement le cookie.

## 39. AAA pattern

### Arrange

Préparer le contexte.

Exemple :

```txt
créer credentials
register
login
récupérer cookie
```

### Act

Faire l’action testée.

Exemple :

```txt
GET /auth/me
```

### Assert

Vérifier le résultat.

Exemple :

```txt
status 200
email correct
userId présent
```

## 40. `response.body` et TypeScript

Supertest expose souvent :

```ts
response.body;
```

comme `any`.

Avec ESLint strict, cela peut déclencher :

```txt
no-unsafe-assignment
no-unsafe-member-access
```

Approche pragmatique retenue :

```ts
const body = response.body as {
  userId: number;
  email: string;
};
```

Cela reste acceptable dans un test e2e localisé.

## 41. `:` vs `as` en TypeScript

Différence importante :

```ts
const body: BodyType = response.body;
```

signifie :

```txt
TypeScript, vérifie que response.body est bien BodyType.
```

Alors que :

```ts
const body = response.body as BodyType;
```

signifie :

```txt
TypeScript, fais-moi confiance.
```

Mnémotechnique :

```txt
:  = prouve-le
as = crois-moi
```

## 42. `as unknown as string[]`

Utilisé quand TS refuse un cast direct.

Mental model :

```txt
unknown = zone neutre
```

```ts
const cookies = response.headers["set-cookie"] as unknown as string[];
```

Cela signifie :

```txt
Je prends la responsabilité du cast.
```

À utiliser localement, avec parcimonie.

## 43. Pourquoi ne pas mocker la DB en e2e

En e2e, on cherche à tester le vrai flow :

```txt
HTTP
Nest
Services
TypeORM
PostgreSQL
JWT
Passport
Cookies
```

Donc :

```txt
e2e → vraie DB contrôlée
unit test → mocks
```

Pour éviter les collisions :

```ts
email: `e2e-${Date.now()}@jest-spec.com`;
```

## 44. Ce que la branche permet maintenant

Cette branche met en place :

```txt
auth context restoration
```

C’est-à-dire :

```txt
Le backend peut savoir quel utilisateur est associé à une requête protégée.
```

Cela prépare directement :

```txt
Applications routes
→ utiliser request.user.userId
→ créer des candidatures liées au user courant
→ filtrer par ownership
```
