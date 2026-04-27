# User journey

## Main routes

1. inscription / connexion
1. création candidature
1. gestion candidature
1. gestion documents

## User flow

### Inscription / connexion

Page : /register

- action : saisir email + mot de passe
- action : valider formulaire
- action : recevoir email
- action : cliquer lien activation
- Page : /login
- action : se connecter
- Page : /dashboard

### Création candidature

Page : /dashboard

- action : cliquer "Créer une candidature"
- Page : /candidatures/new
- action : remplir formulaire
- action : ajouter documents (modal / composant)
- action : submit
- Page : /candidatures/:id

### Gestion candidature

Page : /dashboard

- action : voir Kanban
- Page : /candidatures/:id
- action : modifier informations
- action : changer statut (drag & drop / select)
- action : ajouter tags
- action : supprimer candidature
- retour : /dashboard

### Gestion documents

Page : /dashboard

- action : cliquer "Mes documents"
- Page : /documents
- action : uploader document
- action : supprimer document
- action : associer document à candidature
- action : dissocier document
