# Applications read ownership

Cette note documente le comportement mis en place pour les lectures d'applications appartenant a l'utilisateur courant.

Elle couvre trois sujets :

- la règle d'ownership sur les endpoints read-only ;
- l'injection du userId courant via un décorateur custom ;
- la répartition des responsabilités entre auth, controller et service.

---

## Objectif

Un utilisateur authentifié ne doit pouvoir lire que ses propres candidatures.

Autrement dit :

- `GET /applications` retourne uniquement les applications du user courant ;
- `GET /applications/:id` retourne uniquement l'application `:id` si elle appartient au user courant ;
- si l'application existe en base mais n'appartient pas au user courant, la réponse doit être `404 Not Found`.

Le point important est que le filtrage ne repose pas sur le frontend ni sur un simple check visuel :

```txt
ownership = contrainte backend
```

---

## Flow runtime

Le flux complet est le suivant :

```txt
HTTP Request
  -> JwtAuthGuard
    -> JwtStrategy.validate()
      -> request.user
        -> @CurrentUserId()
          -> ApplicationsController
            -> ApplicationsService
              -> Repository<Application>
                -> PostgreSQL
```

---

## 1. Auth : d'ou vient request.user ?

La route est protegee par `@UseGuards(JwtAuthGuard)`.

Le guard JWT s'appuie sur la strategy JWT.

La strategy :

- extrait le token ;
- le vérifie ;
- retourne un objet user minimal.

Exemple conceptuel :

```ts
validate(payload: JwtPayload): { userId: number; email: string } {
  return {
    userId: payload.sub,
    email: payload.email,
  };
}
```

Cette valeur est ensuite attachée sur :

```txt
request.user
```

Le controller n'a donc pas besoin de recalculer l’identité courante.

---

## 2. Decorateur custom `@CurrentUserId()`

Au lieu de récupérer `@Req()` dans chaque handler puis de faire un cast manuel sur `request.user`, on utilise un décorateur de paramètre.

Role du décorateur :

- lire la request HTTP courante ;
- verifier qu'un user a bien ete attache ;
- retourner directement `userId`.

Exemple :

```ts
export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<{
      user?: { userId: number; email: string };
    }>();

    if (!request.user) {
      throw new UnauthorizedException("User not found in request");
    }

    return request.user.userId;
  },
);
```

Benefices :

- controller plus lisible ;
- suppression des casts répétés ;
- tests unitaires de controller plus simples ;
- logique de lecture de `request.user` centralisée.

---

## 3. Controller : couche HTTP seulement

Le controller ne decide pas des regles d'acces metier. Il :

- declare les routes ;
- applique le guard ;
- récupère `userId` et `id` ;
- délègue au service.

Exemple :

```ts
@UseGuards(JwtAuthGuard)
@Get()
findAllFromUser(@CurrentUserId() userId: number) {
  return this.applicationsService.findAllFromUser(userId);
}

@UseGuards(JwtAuthGuard)
@Get(':id')
findOneFromUser(
  @CurrentUserId() userId: number,
  @Param('id', ParseIntPipe) id: number,
) {
  return this.applicationsService.findOneFromUser(userId, id);
}
```

Le controller reste donc un thin controller :

```txt
HTTP -> Service
```

---

## 4. Service : la règle d'ownership vit ici

Le service applique la contrainte d'appartenance directement dans la requête TypeORM.

### Liste

Pour `findAllFromUser(userId)` :

```ts
return this.applicationsRepository.find({
  where: { user: { userId } },
  relations: {
    user: true,
    company: true,
    contract: true,
    status: true,
  },
});
```

Effet :

- la requête ne lit que les applications du user courant ;
- si aucune ligne ne correspond, le résultat est `[]`.

### Élément unique

Pour `findOneFromUser(userId, applicationId)` :

```ts
const application = await this.applicationsRepository.findOne({
  where: { user: { userId }, applicationId },
  relations: {
    user: true,
    company: true,
    contract: true,
    status: true,
  },
});

if (!application) {
  throw new NotFoundException(
    `No application #${applicationId} for userId #${userId}`,
  );
}
```

Effet :

- si l'application n'existe pas pour ce user, le service lève une `NotFoundException` ;
- Nest transforme ensuite cette exception en réponse HTTP `404`.

---

## Pourquoi `404` et pas `403` ?

Dans ce design, on ne révèle pas si la ressource existe pour quelqu'un d'autre.

Du point de vue du user courant :

```txt
Cette application n'existe pas pour toi.
```

Le `404` exprime donc bien le contrat métier exposé par l'endpoint.

---

## Repartition des responsabilités

### Strategy / Guard

- authentifier la requête ;
- construire `request.user`.

### Décorateur `@CurrentUserId()`

- extraire le `userId` depuis la request ;
- rendre ce `userId` injectable dans les handlers.

### Controller

- définir les routes HTTP ;
- transmettre les bons arguments au service.

### Service

- appliquer la règle d'ownership ;
- lever la `NotFoundException` si nécessaire.

### Repository

- exécuter la requête base de données avec le filtre `user.userId`.

---

## Tests

Les tests unitaires se repartissent naturellement en deux niveaux.

### Controller spec

Le controller spec vérifie surtout :

- que le controller appelle le bon service ;
- qu'il transmet bien `userId` et `applicationId`.

### Service spec

Le service spec vérifie surtout :

- que le repository est appel avec le bon `where` ;
- que `findOneFromUser` lève une `NotFoundException` quand `findOne()` retourne `null`.

La vraie règle métier d'ownership est donc principalement testée au niveau du service.

---

## Hors scope de cette branche

Cette branche traite le read ownership sur `Application`.

Elle ne cherche pas à corriger globalement les incohérences éventuelles entre :

- `nullable: true` côté TypeORM ;
- et certains types TypeScript d'entités encore modélisés en propriétés optionnelles plutôt qu'en `| null`.

Ce sujet doit être traité séparément dans une branche dédiée de cleanup du modèle de types.

---

## Conclusion

Le read ownership sur `Application` repose sur une idée simple :

```txt
le userId courant est injecté une fois,
puis appliqué comme filtre métier dans le service.
```

Ce choix permet :

- des controllers fins ;
- une logique métier centralisée ;
- une API plus sûre ;
- des tests unitaires plus clairs.
