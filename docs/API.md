# Référence de l’API

Toutes les réponses JSON utilisent la forme `{ "success": true, "data": ... }`. Les routes privées utilisent le cookie de session et les mutations authentifiées exigent l’en-tête `X-CSRF-Token` envoyé automatiquement par l’interface.

## Authentification

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Authentifié |
| GET | `/api/auth/me` | Authentifié |
| PUT | `/api/auth/password` | Authentifié |

## Tickets

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/tickets` | Selon le rôle |
| POST | `/api/tickets` | Employé ou administrateur dans l’interface |
| GET | `/api/tickets/:id` | Ticket autorisé |
| PUT | `/api/tickets/:id` | Propriétaire si ouvert, ou administrateur |
| DELETE | `/api/tickets/:id` | Administrateur |
| PATCH | `/api/tickets/:id/status` | Technicien affecté ou administrateur |
| PATCH | `/api/tickets/:id/assign` | Administrateur |
| GET | `/api/tickets/:id/attachment` | Ticket autorisé |
| GET | `/api/tickets/:id/comments` | Ticket autorisé |
| POST | `/api/tickets/:id/comments` | Ticket autorisé |

Paramètres disponibles pour `GET /api/tickets` : `page`, `limit`, `search`, `status`, `priority` et `category`.

## Administration et indicateurs

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/dashboard/stats` | Authentifié, données filtrées par rôle |
| GET | `/api/admin/users` | Administrateur |
| GET | `/api/admin/technicians` | Administrateur |
| PATCH | `/api/admin/users/:id/role` | Administrateur |
| PATCH | `/api/admin/users/:id/status` | Administrateur |
| GET | `/api/admin/logs` | Administrateur |
