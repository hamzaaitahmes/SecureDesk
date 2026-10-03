# Dossier de sécurité

## Mesures intégrées

| Risque | Protection mise en place |
|---|---|
| Mots de passe divulgués | Hachage bcrypt avec facteur 12 |
| Vol de jeton par JavaScript | JWT dans un cookie HttpOnly |
| Requête forgée | Double jeton CSRF sur les actions authentifiées |
| Accès à un ticket tiers | Filtrage par propriétaire, attribution et rôle |
| Force brute | Limitation IP et verrouillage temporaire après cinq échecs |
| XSS stockée | Suppression des balises HTML côté serveur |
| Injection NoSQL | Suppression des clés commençant par `$` ou contenant `.` |
| Mauvais fichier | Liste MIME autorisée, nom aléatoire et limite de 2 Mo |
| Fuite d’informations | Messages d’erreur génériques en production |
| Actions non traçables | Collection `AuditLog` réservée aux administrateurs |
| Mauvaise configuration HTTP | Helmet et en-têtes Nginx sécurisés |

## Audit OWASP ZAP

1. Lancez SecureDesk localement avec Docker.
2. Ouvrez OWASP ZAP et choisissez l’exploration manuelle.
3. Utilisez uniquement l’adresse `http://localhost:3000`.
4. Connectez-vous avec un compte de démonstration.
5. Lancez l’exploration passive, puis enregistrez le rapport HTML.
6. Analysez les alertes, corrigez les erreurs confirmées et relancez l’audit.

N’effectuez jamais de scan sur un site tiers ou un système d’entreprise sans autorisation écrite.

## Avant un vrai déploiement

- remplacer `JWT_SECRET` par une valeur aléatoire ;
- mettre `SEED_DEMO=false` et supprimer les comptes de démonstration ;
- utiliser HTTPS puis mettre `COOKIE_SECURE=true` ;
- protéger MongoDB avec un compte et un mot de passe ;
- utiliser un stockage antivirus pour les pièces jointes ;
- centraliser et surveiller les journaux ;
- sauvegarder régulièrement la base de données.

