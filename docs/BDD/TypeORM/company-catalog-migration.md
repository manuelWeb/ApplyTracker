# Migration du catalogue d'entreprises

## Objectif

Cette migration fait évoluer `companies` vers un modèle de catalogue partagé.

Elle ajoute :

- `normalized_name` pour dédupliquer les entreprises et préparer l'autocomplete.
- `is_verified` pour permettre une future modération du catalogue.
- `created_by_user_id` pour tracer l'utilisateur ayant proposé une entreprise, sans en faire le propriétaire exclusif.

Le modèle reste volontairement partagé : une entreprise peut être réutilisée par plusieurs utilisateurs via leurs candidatures.

## Pourquoi une migration manuelle

TypeORM peut générer des migrations automatiquement, mais ici le changement contient une transformation de données.

`normalized_name` doit devenir `NOT NULL` et `UNIQUE`, mais la table peut déjà contenir des lignes. Une migration directe du type :

```sql
ALTER TABLE "companies" ADD "normalized_name" character varying(255) NOT NULL;
```

serait fragile, car PostgreSQL ne saurait pas quelle valeur mettre sur les lignes existantes.

La migration manuelle permet donc de contrôler l'ordre :

```text
ajouter nullable
remplir les anciennes lignes
valider les données
poser les contraintes
```

## Étapes de la migration

### 1. Ajouter `normalized_name` en nullable

```sql
ALTER TABLE "companies" ADD "normalized_name" character varying(255);
```

Sans `NOT NULL`, une colonne PostgreSQL est nullable par défaut.

Cette étape est volontaire : elle permet d'ajouter la colonne sans casser les lignes déjà présentes.

### 2. Backfill de `normalized_name`

```sql
UPDATE "companies"
SET "normalized_name" = regexp_replace(lower(trim("name")), '[[:space:]]+', ' ', 'g')
WHERE "normalized_name" IS NULL;
```

Le backfill est un remplissage rétroactif : on ajoute une colonne puis on revient remplir les données existantes.

Dans cette requête :

- `trim("name")` retire les espaces au début et à la fin.
- `lower(...)` passe le nom en minuscules.
- `regexp_replace(..., '[[:space:]]+', ' ', 'g')` remplace les suites d'espaces internes par un seul espace.

Exemple :

```text
"  Open   AI  " -> "open ai"
```

La requête ne supprime donc pas tous les espaces. Elle normalise les espaces multiples.

## Validations avant contraintes

### Noms invalides

Avant de passer `normalized_name` en `NOT NULL`, la migration vérifie qu'aucune valeur n'est `NULL` ou vide.

Cas typique :

```text
name = "     "
```

Après `trim`, cela donne une chaîne vide.

La migration remonte une erreur explicite avec les lignes concernées :

```text
Cannot make companies.normalized_name mandatory. Invalid companies: 3:<name>, 7:<name>
```

Requête de debug équivalente :

```sql
SELECT company_id, name, normalized_name
FROM companies
WHERE normalized_name IS NULL OR normalized_name = '';
```

### Doublons

Avant d'ajouter la contrainte unique, la migration vérifie que plusieurs lignes ne partagent pas le même `normalized_name`.

Exemple :

```text
Open AI   -> open ai
open   ai -> open ai
OPEN AI   -> open ai
```

La migration remonte une erreur du type :

```text
Cannot add unique constraint on companies.normalized_name. Duplicate normalized names: open ai (3), doctolib (2)
```

Requête de debug simple :

```sql
SELECT normalized_name, COUNT(*)
FROM companies
GROUP BY normalized_name
HAVING COUNT(*) > 1;
```

Requête de debug détaillée :

```sql
SELECT company_id, name, normalized_name
FROM companies
WHERE normalized_name IN (
  SELECT normalized_name
  FROM companies
  GROUP BY normalized_name
  HAVING COUNT(*) > 1
)
ORDER BY normalized_name, company_id;
```

## Contraintes ajoutées

Une fois les données validées, la migration pose les contraintes :

```sql
ALTER TABLE "companies" ALTER COLUMN "normalized_name" SET NOT NULL;
ALTER TABLE "companies" ADD CONSTRAINT "UQ_companies_normalized_name" UNIQUE ("normalized_name");
```

`UQ_companies_normalized_name` est le nom de la contrainte unique.

Ce nom sert notamment à :

- lire plus clairement les erreurs PostgreSQL.
- identifier la contrainte dans la base.
- la supprimer explicitement dans le `down()`.

## Champs de catalogue

```sql
ALTER TABLE "companies" ADD "is_verified" boolean NOT NULL DEFAULT false;
```

`is_verified` est ajouté directement en `NOT NULL`, car PostgreSQL peut remplir les lignes existantes avec le `DEFAULT false`.

```sql
ALTER TABLE "companies" ADD "created_by_user_id" integer;
```

`created_by_user_id` reste nullable.

Une entreprise seedée, importée ou créée par un mécanisme système peut donc ne pas avoir de créateur utilisateur.

## Index et clé étrangère

```sql
CREATE INDEX "IDX_companies_created_by_user_id"
ON "companies" ("created_by_user_id");
```

L'index facilite les futures recherches ou jointures sur l'utilisateur ayant proposé une entreprise.

```sql
ALTER TABLE "companies"
ADD CONSTRAINT "FK_companies_created_by_user_id"
FOREIGN KEY ("created_by_user_id")
REFERENCES "users"("user_id")
ON DELETE SET NULL
ON UPDATE NO ACTION;
```

`ON DELETE SET NULL` signifie que si l'utilisateur créateur est supprimé, l'entreprise reste dans le catalogue, mais sa provenance devient inconnue.

Ce comportement colle au modèle métier : `created_by_user_id` représente une provenance, pas un ownership strict.

## Rollback

Le `down()` retire les éléments dans l'ordre inverse :

```text
FK
index
created_by_user_id
is_verified
contrainte unique
normalized_name
```

Cet ordre évite de supprimer une colonne encore utilisée par une contrainte ou un index.

## Commandes utiles

Exécuter la migration depuis `backend/` :

```bash
npm run migration:run
```

Revenir en arrière :

```bash
npm run migration:revert
```

Vérifier les colonnes :

```sql
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;
```

Vérifier le backfill :

```sql
SELECT company_id, name, normalized_name, is_verified, created_by_user_id
FROM companies;
```
