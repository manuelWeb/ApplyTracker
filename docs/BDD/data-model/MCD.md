# MCD

```mocodo
:
COMMENTAIRE: num_commentaire, contenu, date_commentaire
:

:
POSSEDE_COMMENTAIRE, 0N EVENEMENT, 11 COMMENTAIRE
EVENEMENT: num_evenement, type_evenement, date_evenement
:

:
LIE_ENTREPRISE, 11 CANDIDATURE, 0N ENTREPRISE
POSSEDE_EVENEMENT, 0N CANDIDATURE, 11 EVENEMENT
UTILISE_CONTRAT, 11 CANDIDATURE, 0N CONTRAT
CONTRAT: num_contrat, nom
:

:
STATUT: num_statut, ordre, nom
A_POUR_STATUT, 11 CANDIDATURE, 0N STATUT
CANDIDATURE: num_candidature, poste, domaine_du_poste, but_du_projet, description_offre, score,url_offre, localisation
QUALIFIE_CANDIDATURE, 0N CANDIDATURE, 0N TAG
:

:
ENTREPRISE: num_entreprise, nom, nom_normalise, site_web, est_verifiee
POSSEDE_CANDIDATURE, 0N UTILISATEUR,11 CANDIDATURE
:
UTILISE_DOCUMENT, 0N CANDIDATURE, 0N DOCUMENT
TAG: num_tag, nom
QUALIFIE_EMAIL_TEMPLATE, 0N EMAIL_TEMPLATE, 0N TAG
EMAIL_TEMPLATE: num_email_template, nom, sujet, corps

CONTACT: num_contact, nom, prenom, email, telephone, role, notes
POSSEDE_CONTACT, 0N ENTREPRISE, 11 CONTACT
:
POSSEDE_DOCUMENT, 0N UTILISATEUR, 11 DOCUMENT
DOCUMENT: num_document, nom, type_document, file_path
QUALIFIE_DOCUMENT, 0N DOCUMENT, 0N TAG
:

:
A_CREE_ENTREPRISE, 0N UTILISATEUR, 01 ENTREPRISE
UTILISATEUR: num_utilisateur, email, password
:
POSSEDE_EMAIL_TEMPLATE, 0N UTILISATEUR, 11 EMAIL_TEMPLATE
:

```

## Liens mocodo

- diagramme [MCD.mcd](https://www.mocodo.net/?mcd=eNptU02P4yAMvfMr8gNymF57Qy27ipR-bJrsFTGJu8MqgQjIjPbfr4EkJZ1KVQl-xs9-tvfkcDmd2LmmRcX2mZoG3uphAOWENJBnrVYO1JRnnXCQQmRP8He93G7syHgSJM_ezhn7zc7MW_Jst8sSlKxIJINPUOBj5pn7N0J6D4zrPfKVBeP4tmLXqrixGJyej8WR1s1CvcJrdkk26LB5gAFWlDR1UeI7rAZj0Ppl-Bkj87lIppwRmLPSQ0z0VuOTGbVOuAlBbTovqfeh_HppKh69XvJEiCTmmUqoTqI0kw81auvw6PQgpALeTXy2vE8u3Iz-C15KsK2Ro5NacX2_-6e21XhMpl8MvW5FL63wTuRXQ8viB4r9rfyne01_xoIfss-NRUVgNNLGisMfV9oMnsTzS-zuF7znGVjHP8HIuwR4DNQTT2wNrVlT5Vu1kHvp2_FyaF63Ge8LSDDlmKITf2I31mrZiRYlr9npWiJVHKfvJl_z1jyXjF3ouYNh7IVbyrZT6ACqPVoSpoYekqkRrZsdRwPhDFFwG6CH8UMrjGN0H6I5sMnChUBPEz9vW4CS7dzokirp3Vddlo-YXKfbKe5hyCos58N2lz3wUbiPh3Ybks1lnRHKDxXbLvBzQm-7dIETKGY1ORlmFCazKjUKa79wt5KCXzTtueytC9n_B50mhoc=)
