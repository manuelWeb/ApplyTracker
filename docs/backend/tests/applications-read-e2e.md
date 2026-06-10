# Applications read ownership e2e tests

Cette note documente la mise en place des tests e2e liés à la lecture des candidatures (`Application`).

Elle complète la note d'architecture :

- `docs/backend/architecture/applications-read-ownership.md`

L'objectif n'est pas de redécrire l'implémentation, mais d'expliquer comment le comportement est validé de bout en bout.

---

## Objectif

Les tests e2e doivent vérifier le contrat HTTP réel exposé par l'API.

Pour `Application`, le point critique est l'ownership :

```txt
un utilisateur ne doit jamais lire les candidatures d'un autre utilisateur
```

Les tests couvrent donc :

- les accès sans authentification ;
- les accès avec authentification ;
- le filtrage par utilisateur courant ;
- les réponses HTTP attendues ;
- les cas de fuite potentielle entre utilisateurs.

---

## Scénarios couverts

### `GET /applications`

Les cas couverts sont :

- retourne `401` sans authentification ;
- retourne `200` avec `[]` si l'utilisateur authentifié ne possède aucune candidature ;
- retourne `200` avec uniquement les candidatures de l'utilisateur authentifié.

Le scénario ownership principal crée deux utilisateurs :

```txt
user A -> application A
user B -> application B
```

Puis le test authentifie `user A` et vérifie que la réponse contient uniquement `application A`.

Les cas `JWT invalide` et `JWT expiré` ne sont pas dupliqués sur cet endpoint pour l'instant. Ils sont couverts sur `GET /applications/:id`, qui utilise le même `JwtAuthGuard`.

Ce choix garde la suite e2e lisible tout en validant le comportement du guard sur les routes applications.

---

### `GET /applications/:id`

Les cas couverts sont :

- retourne `401` sans authentification ;
- retourne `401` avec un token JWT invalide ;
- retourne `401` avec un token JWT expiré ;
- retourne `200` si l'application demandée appartient à l'utilisateur authentifié ;
- retourne `404` si l'application n'existe pas ;
- retourne `404` si l'application existe mais appartient à un autre utilisateur.

Le cas le plus important est :

```txt
user A tente de lire application B
=> 404 Not Found
```

Ce choix évite de révéler qu'une ressource existe chez un autre utilisateur.

---

## Pourquoi utiliser `auth/register` puis `auth/login`

Les tests e2e passent volontairement par les endpoints publics d'authentification.

Cela permet de tester le comportement dans des conditions proches du runtime réel :

```txt
POST /auth/register
POST /auth/login
GET /applications
```

Le test ne fabrique donc pas directement un `request.user`.

Il laisse Nest, Passport, la `JwtStrategy`, le cookie parser et le `JwtAuthGuard` travailler ensemble.

Ce choix valide l'intégration réelle entre :

- le module auth ;
- le cookie `access_token` ;
- le guard JWT ;
- le décorateur `@CurrentUserId()`;
- le controller applications ;
- le service applications ;
- TypeORM.

---

## `Set-Cookie` vs `Cookie`

Lors du login, le serveur répond avec un header HTTP :

```txt
Set-Cookie: access_token=...
```

Ce header signifie :

```txt
serveur -> client : stocke ce cookie
```

Dans le test e2e, on le récupère ainsi :

```ts
const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
```

Puis on le renvoie sur la requête protégée :

```ts
await request(app.getHttpServer())
  .get('/applications')
  .set('Cookie', cookies);
```

Cette fois, le header signifie :

```txt
client -> serveur : voici les cookies stockés
```

Il ne faut donc pas reconstruire le cookie avec :

```ts
.set('Cookie', [`access_token=${accessToken}`]);
```

car `accessToken` contient déjà souvent une chaîne complète de cookie, par exemple :

```txt
access_token=...; Path=/; HttpOnly
```

Reconstruire `access_token=${accessToken}` produit alors une valeur incorrecte.

---

## Pourquoi récupérer `JwtService` via `app.get()`

Pour générer un token expiré réaliste, le test utilise le `JwtService` connu par Nest :

```ts
const jwtService = app.get(JwtService);
```

On évite :

```ts
const jwtService = new JwtService();
```

car cette instance serait créée hors du container Nest.

Elle ne bénéficierait donc pas automatiquement de la configuration réelle de l'application.

Dans un test e2e, on veut utiliser les providers tels qu'ils existent au runtime :

```txt
app.get(JwtService)
=> instance Nest réelle
=> configuration réelle
=> comportement proche de l'application
```

---

## Tester un token invalide

Le token invalide est simulé avec une valeur volontairement incorrecte :

```ts
const invalidToken = 'invalid.jwt.token';
```

Puis envoyé comme cookie :

```ts
await request(app.getHttpServer())
  .get('/applications/1')
  .set('Cookie', [`access_token=${invalidToken}`]);
```

Le résultat attendu est :

```txt
401 Unauthorized
```

Ce test vérifie que le guard refuse un token mal formé ou non vérifiable.

---

## Tester un token expiré

Un token expiré ne doit pas être obtenu en modifiant manuellement un JWT existant.

Un JWT est signé. Modifier son payload casse sa signature.

Le test génère donc un token correctement signé, mais déjà expiré :

```ts
const expiredJwt = jwtService.sign(
  {
    sub: 999999,
    email: 'test-application-expired-token@jest-e2e.com',
  },
  {
    expiresIn: -1,
  },
);
```

Le résultat attendu est :

```txt
401 Unauthorized
```

Ce test vérifie que l'expiration du token est bien respectée.

---

## Fixtures TypeORM nécessaires

Pour créer une candidature réaliste, le test doit préparer les entités liées par clés étrangères.

Une `Application` dépend notamment de :

- `User`
- `Company`
- `Contract`
- `Status`

Le test crée donc explicitement ces entités via leurs repositories TypeORM avant de créer l'application.

Exemple conceptuel :

```ts
const application = await applicationRepository.save({
  jobTitle: 'DevOps',
  user,
  company,
  contract,
  status,
});
```

Cela permet de tester le comportement réel avec la base, plutôt que de mocker les relations.

---

## Gestion de `Status.displayOrder`

Le champ `Status.displayOrder` est unique.

Une valeur comme `Date.now()` peut être trop grande pour un `integer` PostgreSQL.

Une valeur fixe peut entrer en conflit avec les seeds.

La solution retenue consiste à lire la valeur maximale existante :

```ts
const maxStatus = await statusRepository
  .createQueryBuilder('status')
  .select('MAX(status.displayOrder)', 'max')
  .getRawOne<{ max: number | null } | undefined>();
```

Puis à l'incrémenter de `1` pour obtenir la prochaine valeur disponible :

```ts
const nextDisplayOrder = (maxStatus?.max ?? 0) + 1;
```

Cette valeur est ensuite utilisée dans la fixture :

```ts
const status = await statusRepository.save({
  displayOrder: nextDisplayOrder,
  name: `status-${nextDisplayOrder}`,
});
```

Cela évite les collisions avec les données déjà présentes.

---

## Lecture du body avec Supertest

Dans Supertest, le corps de réponse est accessible via :

```ts
response.body
```

Mais son type dépend du status HTTP.

Pour un succès :

```txt
200 -> Application ou Application[]
```

Pour une erreur Nest :

```txt
404 -> { message, error, statusCode }
```

Le test peut donc caster explicitement le body selon le cas testé :

```ts
const notFoundBody = response.body as {
  message: string;
  error: string;
  statusCode: number;
};
```

Ce n'est pas le rôle de l'entité TypeORM `Application` de représenter les erreurs HTTP.

Les erreurs appartiennent au contrat API, pas au modèle persistence.

---

## Nettoyage des données

Les tests e2e créent des données réelles en base.

Ils doivent donc nettoyer les données créées après chaque test.

L'ordre de suppression respecte les dépendances :

```txt
applications
users
companies
contracts
statuses
```

Les identifiants créés sont conservés dans des tableaux dédiés :

```ts
createdApplicationIds
createdEmails
createdCompanyIds
createdContractIds
createdStatusIds
```

Puis supprimés dans `afterEach`.

---

## Conclusion

Ces tests e2e valident le comportement réel de lecture des candidatures.

Ils complètent les tests unitaires :

```txt
unit tests -> vérifient les appels et les branches internes
e2e tests  -> vérifient le contrat HTTP réel
```

Le scénario clé reste :

```txt
user A ne doit jamais lire application B
```

C'est ce test qui sécurise concrètement la règle d'ownership côté API.
