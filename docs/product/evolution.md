# Evolution produit

## Catalogue d'entreprises

La V1 utilise un catalogue partage d'entreprises via la table `companies`.
Ce choix permet de réutiliser une meme entreprise entre plusieurs candidatures,
d’éviter les doublons les plus visibles grace a `normalized_name`, et de preparer
un futur champ d'autocompletion lors de la creation d'une candidature.

Dans cette version, `companies` n'est pas modélisée comme une ressource strictement
propre a un utilisateur. Une entreprise peut donc être créée par un utilisateur,
puis réutilisée par un autre si elle correspond deja au catalogue.

## Choix V1

- `POST /companies` permet d'ajouter une entreprise absente du catalogue.
- `GET /companies/autocomplete?search=...` permet de rechercher une entreprise existante.
- `normalized_name` garantit une unicite simple sur le nom normalise.
- `created_by_user_id` conserve une trace optionnelle du créateur sans imposer un ownership strict.
- `PATCH /companies/:id` et `DELETE /companies/:id` ne sont pas exposes aux utilisateurs en V1.

Ne pas exposer la modification et la suppression publiques evite qu'un utilisateur
puisse impacter les candidatures d'autres utilisateurs qui référencent la meme
entreprise. C'est un compromis volontaire : le catalogue est partage, mais sa
gouvernance reste limitée tant qu'aucun role de moderation ou de validation n'est
défini.

## Creation d'une candidature

La creation d'une candidature reste responsable de lier une candidature a une
entreprise existante via `companyId`.

Le flux attendu cote produit est le suivant :

1. L'utilisateur recherche une entreprise via l'autocompletion.
2. Si l'entreprise existe, le front utilise son `companyId`.
3. Si elle n'existe pas, le front crée l'entreprise via `POST /companies`.
4. La candidature est ensuite créée avec le `companyId` obtenu.

Ce decoupage garde une separation claire des responsabilités :

`CompaniesService` gère le catalogue d'entreprises, tandis que
`ApplicationsService` gère les candidatures.

## Evolutions possibles

Le modèle actuel peut évoluer sans rupture majeure vers un catalogue plus riche.

Les pistes envisagées sont :

- ajouter un système d'alias pour rapprocher plusieurs variantes d'un meme nom.
- introduire une validation ou moderation des entreprises partagées.
- permettre la fusion de doublons par un role admin.
- améliorer l'autocompletion avec une recherche fuzzy.
- rendre visible, de manière explicite et respectueuse de la vie privée, que plusieurs utilisateurs ciblent la meme entreprise.
- proposer une mise en relation optionnelle entre utilisateurs seulement si le produit le justifie.

Ces evolutions ne font pas partie de la V1. Le modèle actuel vise d'abord une base
simple, robuste et compatible avec ces extensions futures.
