# Cahier des charges — SecureDesk

## 1. Contexte

Les demandes informatiques transmises oralement ou par messages sont difficiles à suivre. SecureDesk centralise les incidents, leur priorité, leur attribution et leur résolution, tout en protégeant les informations échangées.

## 2. Objectif général

Concevoir, développer et sécuriser une application web permettant aux employés de déclarer des incidents et au service informatique de les traiter avec une traçabilité complète.

## 3. Acteurs

- **Employé** : crée, consulte et commente ses tickets.
- **Technicien** : consulte les tickets qui lui sont attribués, les commente et change leur statut.
- **Administrateur** : consulte tous les tickets, réalise les attributions, gère les comptes et consulte le journal d’audit.

## 4. Exigences fonctionnelles

1. Un visiteur peut créer un compte Employé et se connecter.
2. Un employé peut créer un ticket avec catégorie, priorité et pièce jointe facultative.
3. Chaque utilisateur voit uniquement les tickets autorisés par son rôle.
4. Un administrateur peut affecter un ticket à un technicien actif.
5. Un technicien ou un administrateur peut faire évoluer le statut d’un ticket.
6. Les utilisateurs autorisés peuvent échanger des commentaires sur un ticket.
7. Le tableau de bord présente les indicateurs adaptés au rôle.
8. Les actions sensibles apparaissent dans un journal réservé à l’administrateur.

## 5. Exigences non fonctionnelles

- interface responsive et en français ;
- mots de passe hachés, jamais enregistrés en clair ;
- authentification expirant après huit heures ;
- validation des données sur le serveur ;
- contrôle d’accès sur chaque ressource ;
- fichiers limités à 2 Mo et à quatre formats autorisés ;
- erreurs serveur sans détails techniques en production ;
- démarrage reproductible avec Docker Compose.

## 6. Critères d’acceptation

- une requête sans session vers un ticket retourne HTTP 401 ;
- un utilisateur authentifié mais non autorisé ne reçoit pas les données ;
- un technicien voit uniquement les tickets qui lui sont affectés ;
- seul un administrateur peut modifier les rôles ;
- les entrées HTML et les opérateurs NoSQL dangereux sont neutralisés ;
- les tentatives répétées de connexion sont limitées ;
- l’application démarre avec une seule commande Docker.

