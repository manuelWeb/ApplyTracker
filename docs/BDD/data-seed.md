# Database seeding avec TypeORM

Cette documentation décrit la mise en place du système de seed de la base de données pour le backend ApplyTracker.

L’objectif est d’avoir un seed :

- lisible ;
- idempotent ;
- compatible avec les tests ;
- aligné avec une approche NestJS / TypeORM propre ;
- capable de créer des données relationnelles sans hardcoder les clés étrangères.

## Objectif du seed

Le seed permet d’initialiser une base avec des données minimales utiles au développement.

Dans ApplyTracker, les données seedées sont actuellement :

- `statuses` ;
- `contracts` ;
- `users` ;
- `companies` ;
- `applications`.

On distingue deux types de données :

| Type                     | Exemple                        | Rôle                                    |
| ------------------------ | ------------------------------ | --------------------------------------- |
| Données de référence     | statuses, contracts            | nécessaires au fonctionnement de l’app  |
| Données de développement | users, companies, applications | utiles pour tester l’API et le frontend |

## Commande npm

Le seed est lancé depuis le backend avec :

```bash
npm run db:seed
```

Le script s’appuie sur `ts-node` et `tsconfig-paths/register` afin de pouvoir utiliser les imports absolus configurés dans TypeScript.

Exemple :

```json
{
  "scripts": {
    "db:seed": "ts-node -r tsconfig-paths/register src/database/seeds/seed.ts"
  }
}
```

## Structure générale

Structure recommandée :

```txt
src/database/seeds/
  seed.ts
  seeders/
    index.ts
    seeder.interface.ts
    status.seeder.ts
    contract.seeder.ts
    user.seeder.ts
    company.seeder.ts
    application.seeder.ts
```

## Interface Seeder

Chaque seeder respecte le même contrat :

```ts
export interface Seeder {
  run(): Promise<void>;
}
```

Cela permet au runner d’exécuter tous les seeders de manière uniforme.

## Runner des seeders

Le runner reçoit une liste de seeders et les exécute dans l’ordre.

```ts
export async function runSeeders(seeders: Seeder[]): Promise<void> {
  for (const seeder of seeders) {
    logger.log(`Running seeder: ${seeder.constructor.name}`);
    await seeder.run();
    logger.log(`Seeder completed: ${seeder.constructor.name}`);
  }
}
```

L’utilisation de `for...of` est volontaire : elle permet d’attendre chaque `await` avant de passer au seeder suivant.

À éviter :

```ts
seeders.forEach(async (seeder) => {
  await seeder.run();
});
```

`forEach` ne gère pas correctement le flux asynchrone attendu dans ce cas.

## Orchestration dans `seed.ts`

Le fichier `seed.ts` est le chef d’orchestre.

Il doit :

1. initialiser le `DataSource` TypeORM ;
2. créer les repositories nécessaires ;
3. injecter les repositories dans les seeders ;
4. exécuter les seeders dans le bon ordre ;
5. fermer proprement la connexion ;
6. retourner un exit code correct.

Exemple de flow :

```txt
initialize DataSource
→ create repositories
→ run seeders
→ destroy DataSource
→ exit(0) ou exit(1)
```

Le bloc `finally` garantit que la connexion est fermée après succès ou erreur.

```ts
async function bootstrap(): Promise<void> {
  console.log("Starting database seed…");

  await typeOrmDataSource.initialize();
  console.log("Database connection established!");

  try {
    const repositories = createRepositories();

    // Keep dependency-based order: referenced entities first, applications last.
    await runSeeders([
      new StatusSeeder(repositories.statusRepository),
      new ContractSeeder(repositories.contractRepository),
      new UserSeeder(repositories.userRepository),
      new CompanySeeder(repositories.companyRepository),
      new ApplicationSeeder(
        repositories.applicationRepository,
        repositories.userRepository,
        repositories.companyRepository,
        repositories.contractRepository,
        repositories.statusRepository,
      ),
    ]);
  } finally {
    if (typeOrmDataSource.isInitialized) {
      await typeOrmDataSource.destroy();
      console.log("DB connection closed.");
    }
  }
}

bootstrap()
  .then(() => {
    console.log("Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed!", error);
    process.exit(1);
  });
```

## Ordre des seeders

L’ordre est important à cause des relations SQL.

`applications` référence plusieurs tables :

- `users` ;
- `companies` ;
- `contracts` ;
- `statuses`.

Ces tables doivent donc être seedées avant `applications`.

Ordre actuel recommandé :

```txt
1. StatusSeeder
2. ContractSeeder
3. UserSeeder
4. CompanySeeder
5. ApplicationSeeder
```

## Pattern d’un seeder simple

Un seeder simple suit généralement ce pattern :

```txt
seed data
→ for...of
→ findOne
→ continue si existe
→ create
→ save
```

Exemple simplifié :

```ts
export const seedCompanies = [
  { name: "Example Company", website: "https://www.example.com" },
] as const;

export class CompanySeeder implements Seeder {
  constructor(private readonly companyRepository: Repository<Company>) {}

  async run(): Promise<void> {
    for (const { name, website } of seedCompanies) {
      const existingCompany = await this.companyRepository.findOne({
        where: { name },
      });

      if (existingCompany) {
        console.log(`Company already exists: ${name}`);
        continue;
      }

      const company = this.companyRepository.create({
        name,
        website,
      });

      await this.companyRepository.save(company);

      console.log(`Company created: ${name}`);
    }
  }
}
```

## Pourquoi utiliser `as const` ?

Les données de seed sont des données fixes.

```ts
export const seedCompanies = [
  { name: "Example Company", website: "https://www.example.com" },
] as const;
```

`as const` le cast "as const" permet à TS de conserver les valeurs exactes.

Par exemple :

```ts
seedCompanies[0].name;
```

est typé comme :

```ts
"Example Company";
```

et non comme un simple :

```ts
string;
```

C’est utile pour réutiliser les valeurs entre seeders sans recopier les chaînes à la main.

## Idempotence

Un seed doit pouvoir être exécuté plusieurs fois sans créer de doublons.

Règle :

```txt
npm run db:seed
npm run db:seed
```

Le deuxième run doit afficher que les données existent déjà.

Exemple :

```ts
const existingUser = await this.userRepository.findOne({
  where: { email },
});

if (existingUser) {
  console.log(`User already exists: ${email}`);
  continue;
}
```

Pour les tables simples, on utilise une clé métier unique :

| Table     | Clé métier utilisée |
| --------- | ------------------- |
| users     | email               |
| companies | name                |
| contracts | name                |
| statuses  | name                |

Pour `applications`, la clé métier est composée.

Exemple :

```ts
const existingApplication = await this.applicationRepository.findOne({
  where: {
    jobTitle: appData.jobTitle,
    user: { email: appData.userEmail },
    company: { name: appData.companyName },
  },
});
```

Cela évite de considérer deux candidatures différentes comme identiques uniquement parce qu’elles ont le même intitulé de poste.

## Seed relationnel : ApplicationSeeder

`ApplicationSeeder` est plus complexe car il dépend de plusieurs tables.

Il ne faut pas hardcoder les clés étrangères.

À éviter :

```ts
userId: 1,
companyId: 1,
contractId: 1,
statusId: 1,
```

À faire : récupérer les entités parentes via leurs clés métier.

```ts
const user = await this.userRepository.findOneOrFail({
  where: { email: appData.userEmail },
});

const company = await this.companyRepository.findOneOrFail({
  where: { name: appData.companyName },
});

const contract = await this.contractRepository.findOneOrFail({
  where: { name: appData.contractName },
});

const status = await this.statusRepository.findOneOrFail({
  where: { name: appData.statusName },
});
```

Ensuite, TypeORM peut créer l’application avec les relations :

```ts
const application = this.applicationRepository.create({
  jobTitle: appData.jobTitle,
  jobDomain: appData.jobDomain,
  location: appData.location,
  projectGoal: appData.projectGoal,
  jobDescription: appData.jobDescription,
  jobUrl: appData.jobUrl,
  score: appData.score,
  user,
  company,
  contract,
  status,
});
```

TypeORM traduit les relations en clés étrangères lors de la sauvegarde.

```ts
await this.applicationRepository.save(application);
```

## Pourquoi ne pas spread `appData` dans `ApplicationSeeder` ?

Les données de seed d’une application contiennent des champs techniques utilisés uniquement pour rechercher les relations :

```ts
userEmail;
companyName;
contractName;
statusName;
```

Ces champs ne sont pas des colonnes de l’entity `Application`.

Il ne faut donc pas faire :

```ts
this.applicationRepository.create({
  ...appData,
  user,
  company,
  contract,
  status,
});
```

Car `appData` contient des propriétés qui ne correspondent pas à l’entity.

La version explicite est préférable :

```ts
this.applicationRepository.create({
  jobTitle: appData.jobTitle,
  jobDomain: appData.jobDomain,
  location: appData.location,
  projectGoal: appData.projectGoal,
  jobDescription: appData.jobDescription,
  jobUrl: appData.jobUrl,
  score: appData.score,
  user,
  company,
  contract,
  status,
});
```

C’est plus long, mais plus clair et plus sûr.

## À propos des IDs auto-incrémentés

Il est normal qu’un ID auto-incrémenté ne soit pas continu.

Exemple :

```txt
status_id = 2
display_order = 1
```

Un premier insert échoué peut avoir consommé une valeur d’auto-increment.

Ce n’est pas un problème.

Règle importante :

```txt
Un ID technique auto-généré n’a pas de signification métier.
```

Il ne faut jamais dépendre de `status_id = 1` dans le code applicatif ou les seeds.

On doit utiliser des clés métier comme :

```txt
status.name = 'draft'
user.email = 'admin@example.com'
company.name = 'Example Company'
```

## Vérification manuelle en base

Quelques requêtes utiles :

```sql
SELECT * FROM statuses ORDER BY display_order;
SELECT * FROM contracts;
SELECT user_id, email, password_hash FROM users;
SELECT * FROM companies;
SELECT * FROM applications;
```

Pour vérifier plusieurs valeurs de référence en une seule requête :

```sql
SELECT 'users' AS table_name, email AS value FROM users
UNION ALL
SELECT 'companies', name FROM companies
UNION ALL
SELECT 'contracts', name FROM contracts
UNION ALL
SELECT 'statuses', name FROM statuses
ORDER BY table_name, value;
```

## Vérification attendue

Après deux exécutions :

```bash
npm run db:seed
npm run db:seed
```

Le second run doit afficher uniquement des messages du type :

```txt
Status already exists: draft
User already exists: admin@example.com
Company already exists: Example Company
Contract already exists: Example Contract CDI
Application already exists: Software Engineer for user admin@example.com
```

Il ne doit pas créer de doublons.

## Règles à retenir

- Ne jamais hardcoder les IDs auto-générés.
- Toujours récupérer les relations via des clés métier.
- Un seed doit être idempotent.
- `ApplicationSeeder` doit rester le dernier seeder exécuté.
- `for...of` est préféré à `forEach` pour gérer correctement les opérations async.
- Les données de seed peuvent être exportées en constantes `as const` pour éviter les recopies fragiles.
- Le code doit rester explicite quand il transforme des données de seed en entity TypeORM.
