# Feature Modules NestJS & Graphe TypeORM

## Contexte

Dans cette branche `feature/backend-read-modules`, l’objectif est de structurer l’application backend par domaines métier NestJS avant l’ajout :

- de l’authentification JWT
- des guards
- des routes write
- des tests e2e
- des policies d’accès utilisateur

L’objectif principal est de sortir d’un `AppModule` monolithique afin d’obtenir une architecture modulaire idiomatique NestJS.

---

# Architecture cible

Chaque domaine métier possède désormais son propre module :

```txt
applications/
companies/
contracts/
statuses/
tags/
users/
documents/
etc.
```

Exemple :

```txt
src/applications
├── applications.controller.ts
├── applications.service.ts
├── applications.module.ts
└── entities
    └── application.entity.ts
```

---

# Rôle d’un Feature Module NestJS

Exemple :

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
```

Ce module représente :

```txt
“Tout ce qui est nécessaire au domaine Applications”
```

Il définit :

- les controllers HTTP exposés
- les services injectables
- les repositories TypeORM disponibles dans ce contexte

---

# Comprendre `TypeOrmModule.forFeature()`

## Important

`forFeature()` ne sert PAS à déclarer toutes les entités globales de l’application.

Son rôle principal est :

```txt
Rendre un repository injectable dans le module courant.
```

Exemple :

```ts
TypeOrmModule.forFeature([Application])
```

permet ensuite :

```ts
constructor(
  @InjectRepository(Application)
  private readonly applicationRepository: Repository<Application>,
) {}
```

Sans `forFeature([Application])`, NestJS ne peut pas injecter :

```txt
Repository<Application>
```

dans `ApplicationsService`.

---

# Différence entre `forRoot()` et `forFeature()`

## `TypeOrmModule.forRoot()`

Responsabilité :

```txt
Configurer la connexion TypeORM globale
```

Exemple :

```ts
TypeOrmModule.forRoot(typeOrmConfig)
```

Cette configuration :

- connecte PostgreSQL
- configure TypeORM
- enregistre les entities globales
- construit les metadata ORM

---

## `TypeOrmModule.forFeature()`

Responsabilité :

```txt
Rendre certains repositories injectables dans un feature module
```

Exemple :

```ts
TypeOrmModule.forFeature([Application])
```

Cela ne signifie PAS :

```txt
“injecter automatiquement tous les repositories liés”
```

ou :

```txt
“résoudre automatiquement tout le graphe relationnel”
```

---

# `autoLoadEntities` : confusion fréquente

Au début de cette branche, `autoLoadEntities: true` pouvait laisser penser que :

```txt
TypeORM allait automatiquement résoudre tous les repositories liés
```

Ce n’est pas le cas.

`autoLoadEntities` permet seulement :

```txt
d’ajouter automatiquement certaines entities à la connexion TypeORM
à partir des modules utilisant forFeature()
```

Mais cela ne remplace pas :

```txt
la déclaration explicite du graphe d’entities ORM
```

Dans ce projet, la configuration la plus claire et prévisible est donc :

```ts
entities: [
  Application,
  User,
  Company,
  Contract,
  Status,
  Tag,
  EmailTemplate,
  Document,
  Comment,
  Event,
  Contact,
]
```

avec suppression de :

```ts
autoLoadEntities: true
```

---

# Relations runtime vs graphe ORM TypeORM

## Point important

Il faut distinguer :

```txt
1. Les relations chargées dans une requête
2. Les relations structurelles du modèle ORM
```

---

## Relations chargées dans le service

Exemple :

```ts
relations: {
  user: true,
  company: true,
  contract: true,
  status: true,
}
```

Cela signifie :

```txt
“charger ces relations dans cette requête SQL”
```

Uniquement.

---

## Relations déclarées dans les entities

Exemple :

```ts
@ManyToMany(() => Tag, (tag) => tag.applications)
tags!: Tag[];
```

Ici :

```txt
Application référence structurellement Tag
```

Même si le service ne charge jamais `tags`.

TypeORM doit donc connaître :

```txt
Tag
```

au démarrage.

---

# Exemple réel rencontré

Dans `Application` :

```ts
@ManyToMany(() => Tag, (tag) => tag.applications)
tags!: Tag[];
```

Puis dans `Tag` :

```ts
@ManyToMany(() => EmailTemplate, (emailTemplate) => emailTemplate.tags)
emailTemplates!: EmailTemplate[];
```

Conséquence :

```txt
Application
  → Tag
      → EmailTemplate
```

Donc même si :

- `ApplicationsService` ne charge pas `tags`
- `Application` ne référence pas directement `EmailTemplate`

TypeORM doit tout de même connaître :

```txt
EmailTemplate
```

afin de construire correctement les metadata ORM.

---

# Pourquoi l’API plantait

Erreur rencontrée :

```txt
TypeORMError: Entity metadata for ...
was not found
```

Cause :

```txt
une entity du graphe relationnel n’était pas enregistrée
dans la configuration TypeORM globale
```

Ce problème ne venait PAS :

- des controllers
- des services
- des routes HTTP

mais :

```txt
du graphe metadata TypeORM
```

---

# Règle retenue dans ApplyTracker

## Configuration TypeORM globale

Déclarer explicitement toutes les entities connues :

```ts
entities: [
  Application,
  User,
  Company,
  Contract,
  Status,
  Tag,
  EmailTemplate,
  Document,
  Comment,
  Event,
  Contact,
]
```

---

## Feature modules

Ne déclarer dans `forFeature()` que les repositories réellement injectés.

Exemple :

```ts
imports: [TypeOrmModule.forFeature([Application])]
```

et NON :

```ts
TypeOrmModule.forFeature([
  Application,
  User,
  Company,
  Contract,
  Status,
  Tag,
  EmailTemplate,
  Document,
])
```

---

# Conclusion

Architecture retenue :

```txt
typeorm.config.ts
  → source de vérité globale des entities ORM

Feature modules
  → responsabilité locale d’injection des repositories
```

Cette approche :

- reste idiomatique NestJS
- évite les graphes répétés dans chaque module
- réduit les oublis
- améliore la lisibilité
- garde les modules focalisés sur leur domaine métier
