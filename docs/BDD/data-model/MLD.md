# MLD

> Source mocodo

- CANDIDATURE ( num_candidature, poste, domaine_du_poste, but_du_projet, description_offre, score, url_offre, localisation, #num_entreprise, #num_utilisateur, #num_contrat, #num_statut )
- COMMENTAIRE ( num_commentaire, contenu, date_commentaire, #num_evenement )
- CONTACT ( num_contact, nom, prenom, email, telephone, role, notes, #num_entreprise )
- CONTRAT ( num_contrat, nom )
- DOCUMENT ( num_document, nom, type_document, file_path, #num_utilisateur )
- EMAIL_TEMPLATE ( num_email_template, nom, sujet, corps, #num_utilisateur )
- ENTREPRISE ( num_entreprise, nom, nom_normalise, site_web, est_verifiee, #num_utilisateur_createur nullable )
- EVENEMENT ( num_evenement, type_evenement, date_evenement, #num_candidature )
- QUALIFIE_CANDIDATURE ( #num_candidature, #num_tag )
- QUALIFIE_DOCUMENT ( #num_document, #num_tag )
- QUALIFIE_EMAIL_TEMPLATE ( #num_email_template, #num_tag )
- STATUT ( num_statut, ordre, nom )
- TAG ( num_tag, nom )
- UTILISATEUR ( num_utilisateur, email, password )
- UTILISE_DOCUMENT ( #num_candidature, #num_document )
