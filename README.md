
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


## Comment utiliser le projet après l’avoir installé

###  Accéder à l’interface utilisateur :
- Ouvre le fichier **index.html** directement ou utilise un serveur local comme **WAMPSERVER** ou **XAMPP**.

### S’inscrire / Se connecter :
- Utilise **register.html** pour créer un compte ou **login.html** pour se connecter.

###  Naviguer :
- Consulte **books.html** pour voir la liste des livres.
- Accède à **details.html** pour voir les détails d'un livre.
- Utilise **buy.html** pour acheter un livre.

###  Utiliser le chatbot (optionnel) :
- Va sur **chat.html** pour poser des questions ou obtenir des recommandations.

###  Administration :
- En tant qu’admin, ouvre **admin.html** pour gérer les livres (ajout, modification, suppression).

###  Gestion des commandes :
- Consulte tes reçus et commandes via **orders.html** et **receipt.html**.


