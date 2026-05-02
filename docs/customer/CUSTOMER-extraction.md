# Extraction des besoins

## Entités vs attributs

| Notion            | Type (entité / attribut / ?) | Description                                     |
| ----------------- | ---------------------------- | ----------------------------------------------- |
| utilisateur       | entité                       | compte utilisateur                              |
| candidature       | entité                       | objet principal                                 |
| entreprise        | entité                       | lié à candidature                               |
| document          | entité                       | bibliothèque                                    |
| tag               | entité                       | classification (front, back, fullstack, design) |
| contrat           | entité                       | classification (CDD, CDI)                       |
| statut            | entité                       | état de la candidature                          |
| événement         | entité                       | historique de la candidature                    |
| commentaire       | entité                       | commentaire sur un événement                    |
| contact           | entité                       | contacts de l'entreprise                        |
| email template    | entité                       | modèles d'emails                                |
| poste             | attribut                     | nom du job                                      |
| domaine du poste  | attribut                     | classification (e-commerce, vitrine, etc.)      |
| but du projet     | attribut                     | classification (refonte, optimisation, etc.)    |
| localisation      | attribut                     | Lieu géographique                               |
| url de l'offre    | attribut                     | lien                                            |
| description_offre | attribut                     | texte                                           |

## Entités + attributs

| UTILISATEUR     |
| --------------- |
| num_utilisateur |
| email           |
| password        |

| CANDIDATURE       |
| ----------------- |
| num_candidature   |
| poste             |
| domaine_du_poste  |
| but_du_projet     |
| description_offre |
| score             |
| url_offre         |
| localisation      |

| ENTREPRISE     |
| -------------- |
| num_entreprise |
| nom            |
| site_web       |

| CONTACT     |
| ----------- |
| num_contact |
| nom         |
| prenom      |
| email       |
| telephone   |
| role        |
| notes       |

| EMAIL_TEMPLATE     |
| ------------------ |
| num_email_template |
| nom                |
| sujet              |
| corps              |

| DOCUMENT      |
| ------------- |
| num_document  |
| nom           |
| type_document |
| file_path     |

| EVENEMENT      |
| -------------- |
| num_evenement  |
| type_evenement |
| date_evenement |

| COMMENTAIRE      |
| ---------------- |
| num_commentaire  |
| contenu          |
| date_commentaire |

| STATUT     |
| ---------- |
| num_statut |
| ordre      |
| nom        |

| TAG     |
| ------- |
| num_tag |
| nom     |

| CONTRAT     |
| ----------- |
| num_contrat |
| nom         |

## Actions utilisateur

| Action                                | Objet       |
| ------------------------------------- | ----------- |
| Créer un compte                       | utilisateur |
| S’identifier                          | utilisateur |
| Créer une candidature                 | candidature |
| Modifier une candidature              | candidature |
| Supprimer une candidature             | candidature |
| Associer une entreprise               | candidature |
| Associer un événement                 | candidature |
| Télécharger un ou plusieurs documents | candidature |
| Filtrer les candidatures              | candidature |

## Relations

> Ici on garde un vocabulaire métier, ne pas chercher à avoir des verbes d'association différents pour chaque couple de phrase. Ces verbes d'association doivent rester en adéquation avec le vocabulaire métier, ils doivent être compris par le client et ou les utilisateurs finaux.

- Un utilisateur possède 0,N candidatures
- Une candidature appartient à 1,1 utilisateur
- association mocodo `POSSEDE_CANDIDATURE`

- Un utilisateur possède 0,N documents
- Un document appartient à 1,1 utilisateur
- association mocodo `POSSEDE_DOCUMENT`

- Une candidature est liée à 1,1 entreprise
- Une entreprise est liée à 0,N candidatures
- association mocodo `LIE_ENTREPRISE`

- Une candidature possède 0,N événements
- Un événement appartient à 1,1 candidature
- association mocodo `POSSEDE_EVENEMENT`

- Un événement possède 0,N commentaires
- Un commentaire appartient à 1,1 événement
- association mocodo `POSSEDE_COMMENTAIRE`

- Une candidature est qualifiée par 0,N tags
- Un tag qualifie 0,N candidatures
- association mocodo `QUALIFIE_CANDIDATURE`

- Un email template est qualifié par 0,N tags
- Un tag qualifie 0,N email templates
- association mocodo `QUALIFIE_EMAIL_TEMPLATE`

- Une candidature utilise 0,N documents
- Un document est utilisé par 0,N candidatures
- association mocodo `UTILISE_DOCUMENT`

- Une candidature a pour statut 1,1 statut
- Un statut est utilisé par 0,N candidatures
- association mocodo `A_POUR_STATUT`

- Une candidature utilise 1,1 contrat
- Un contrat est utilisé par 0,N candidatures
- association mocodo `UTILISE_CONTRAT`

- Un document est qualifié par 0,N tags
- Un tag qualifie 0,N documents
- association mocodo `QUALIFIE_DOCUMENT`

- Une entreprise possède 0,N contacts
- Un contact appartient à 1,1 entreprise
- association mocodo `POSSEDE_CONTACT`

- Un utilisateur possède 0,N email templates
- Un email template appartient à 1,1 utilisateur
- association mocodo `POSSEDE_EMAIL_TEMPLATE`
