# Plan de tests

| ID | Test | Résultat attendu |
|---|---|---|
| AUTH-01 | Connexion correcte | HTTP 200, cookie de session créé |
| AUTH-02 | Mot de passe incorrect | HTTP 401 sans préciser si l’e-mail existe |
| AUTH-03 | Cinq échecs successifs | Compte verrouillé temporairement |
| AUTH-04 | Route privée sans cookie | HTTP 401 |
| ACL-01 | Employé demande le ticket d’un autre | Aucune donnée retournée |
| ACL-02 | Technicien demande un ticket non attribué | Aucune donnée retournée |
| ACL-03 | Employé modifie un rôle | HTTP 403 |
| TKT-01 | Création avec données valides | Ticket créé avec numéro unique |
| TKT-02 | Description trop courte | HTTP 400 |
| TKT-03 | Fichier de plus de 2 Mo | HTTP 400 |
| TKT-04 | Fichier exécutable | Rejeté |
| SEC-01 | Requête authentifiée sans jeton CSRF | HTTP 403 |
| SEC-02 | Texte contenant une balise `script` | Balise retirée avant stockage |
| SEC-03 | Corps contenant `$where` | Clé supprimée |
| LOG-01 | Changement de rôle | Événement présent dans AuditLog |
| UI-01 | Affichage sur petit écran | Menu mobile et formulaires utilisables |

## Commandes automatiques

```bash
cd backend && npm test
cd ../frontend && npm run build
```

