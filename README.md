
#  eLibrary - Plateforme Complète de Bibliothèque Numérique

**eLibrary** est une application web dynamique qui permet aux utilisateurs de consulter et acheter des livres en ligne.
Ce projet intègre une interface utilisateur moderne, une gestion côté serveur avec Node.js, et des fonctionnalités avancées
telles qu'une interface administrateur, un système de paiement, et une potentielle intégration d'IA via Python.



##  Objectif du Projet

Le but de **eLibrary** est de digitaliser l'expérience de la bibliothèque :
- Offrir un accès facile à une collection de livres numériques.
- Permettre l'achat des livres.
- Fournir aux administrateurs un outil simple pour gérer les livres, les utilisateurs et les transactions.
- Intégrer des outils modernes comme un chat et des serveurs intelligents.



##  Technologies Utilisées

| Technologie      | Description                                      |
|------------------|--------------------------------------------------|
| **HTML5/CSS3**   | Structure et design des pages web                |
| **JavaScript**   | Dynamisme côté client                            |
| **Node.js**      | Serveur backend                                  |
| **Express.js**   | Framework léger pour Node.js                     |
| **Python 3**     | Script serveur additionnel (IA, API, etc.)       |
| **JSON**         | Stockage des données de livres                   |
| **Git**          | Gestion de version                               |



##  Structure Détaillée du Projet

- **index.html** : Page d'accueil principale.
- **login.html / register.html** : Pages d'authentification.
- **books.html** : Liste des livres disponibles.
- **details.html** : Détails d'un livre sélectionné.
- **buy.html** : Interfaces d'achat.
- **order.html / orders.html** : Suivi des commandes de l'utilisateur.
- **admin.html** : Tableau de bord de l'administrateur.
- **newbook.html / updateBook.html** : Gestion des livres (CRUD).
- **payment.html / receipt.html** : Processus de paiement et reçu.
- **chat.html** : Système de chat intégré.
- **profile.html** : Gestion du profil utilisateur.

Scripts et Serveurs :
- **server.js** : Serveur Node.js principal.
- **proxy-server.js** : Gestion des requêtes proxy.
- **ollamaserver.py** : Serveur Python pour fonctionnalités avancées.
- **Order.js / script.js** : Scripts logiques côté client.

Styles :
- **style.css / styles.css** : Design principal.
- **dark-theme.css** : Thème sombre.

Données :
- **allbooks.json** : Base de données locale des livres.

---


### Comment utiliser le projet

### Accès à l’interface utilisateur
Le projet est déjà hébergé sur GitHub Pages à l'adresse suivante :
https://f87shujin.github.io/eLibrary/
Veuillez noter qu'au premier accès, le serveur Render peut nécessiter environ une minute pour être entièrement opérationnel.
Il n'est donc pas nécessaire de l'ouvrir manuellement ou de l'installer localement.

### Fonctionnalités principales

### S’inscrire / Se connecter
Utiliser `register.html` pour créer un compte, ou `login.html` pour se connecter.

### Naviguer dans la bibliothèque
Accéder à `books.html` pour consulter la liste des livres.
Ouvrir `details.html` pour voir les détails d'un livre spécifique.
Utiliser `buy.html` pour acheter un livre.

### Utiliser le chatbot (optionnel)
Le chatbot repose sur un modèle local utilisant Ollama.
Il ne fonctionnera pas tant que Ollama n'est pas installé localement.
Vous devrez également ouvrir `chat.html` à l’aide d’un serveur proxy local à cause des restrictions de sécurité.
En raison de la taille du modèle et des limites des offres gratuites, l'IA (LLM) n’a pas pu être hébergée sur un serveur public.

### Administration
Accéder à `admin.html` pour ajouter, modifier ou supprimer des livres.

### Gestion des commandes
Consulter vos reçus et votre historique de commandes via `orders.html` et `receipt.html`.





