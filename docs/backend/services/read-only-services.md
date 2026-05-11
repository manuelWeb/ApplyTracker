
# Backend – Services Read-Only

## Objectif

Cette couche introduit les **services read-only** du backend.

Elle répond à un besoin précis dans la construction de l’application :

- Isoler la **logique métier**
- Centraliser l’**accès aux données**
- Définir des **contrats de lecture stables**
- Préparer les futures couches (controllers, auth, write)

---

## Pourquoi maintenant ?

À ce stade du développement :

- Les entités et relations sont définies
- La base de données est prête
- Les cas d’usage principaux sont identifiés

Il devient donc pertinent de :

Lire correctement les données avant de les modifier

Cela permet de :

- Valider le modèle de données
- Structurer les interactions backend
- Construire une base solide pour la suite

---

## Rôle d’un service

Un service :

- Ne gère pas HTTP
- Ne parle pas directement à l’utilisateur
- Ne contient pas de logique de présentation

Il :

- Contient la logique métier
- Appelle le repository (TypeORM)
- Expose des méthodes claires et testables

---

## Structure standard

```ts
@Injectable()
export class EntityService {
  constructor(
    @InjectRepository(Entity)
    private readonly entitiesRepository: Repository<Entity>,
  ) {}

  findAll(): Promise<Entity[]> {
    return this.entitiesRepository.find();
  }

  findOne(id: number): Promise<Entity> {
    return this.entitiesRepository.findOneOrFail({
      where: { id },
    });
  }
}
```

---

## Gestion des relations

Règle clé :

Relation déclarée ≠ relation chargée

Le service décide :

- Quand charger une relation
- Pourquoi la charger

Convention :

- findAll → léger (sans relations)
- findOne → enrichi (avec relations utiles)

---

## Ownership (relations)

Distinction importante :

- Entity = définit la relation
- Service = décide de la charger

Pour les relations complexes :

- Owner side (@JoinTable) → écrit la relation
- Inverse side → lit / navigue

---

## Ressources liées à un utilisateur

Pour les entités appartenant à un utilisateur :

Le userId est utilisé dans le where (sécurité / ownership)

Exemple :

```ts
findOneByUserId(entityId: number, userId: number): Promise<Entity> {
  return this.repository.findOneOrFail({
    where: {
      entityId,
      user: { userId },
    },
  });
}
```

Pour les utilisateurs eux-mêmes :

```ts
findOne(userId: number): Promise<User>
findByEmail(email: string): Promise<User>
```

---

## Tests unitaires

Les tests sont :

- Purs (sans NestJS container)
- Sans base de données
- Basés sur des mocks Jest

Objectif :

Vérifier les appels au repository, pas le comportement de la base de données

---

## Principes clés retenus

- Service = logique métier
- Repository = accès aux données
- Controller = HTTP (non implémenté ici)

- findAll → liste
- findOne → élément unique
- findByX → filtre métier

- Sécurité = filtrer par user si nécessaire

---

## Conclusion

Cette couche pose :

- Une base claire et testée
- Une séparation stricte des responsabilités
- Un socle pour les prochaines étapes

Elle garantit que le backend sait lire ses données proprement avant de savoir les modifier
