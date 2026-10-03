# SecureDesk

SecureDesk est une application web complète de gestion sécurisée des incidents informatiques. Elle a été conçue pour un projet de stage d’un mois et comprend une interface React, une API Express, MongoDB, Docker et une documentation de sécurité.

## Fonctionnalités

- inscription, connexion et déconnexion sécurisées ;
- trois rôles : employé, technicien et administrateur ;
- création, recherche, suivi, affectation et traitement des tickets ;
- commentaires et pièces jointes contrôlées ;
- tableau de bord adapté au rôle ;
- gestion des utilisateurs et des rôles ;
- journal d’audit des actions sensibles ;
- protections JWT, cookies HttpOnly, CSRF, XSS, NoSQL, CORS, Helmet et rate limiting.

## Lancement recommandé avec Docker

### Prérequis

Installez Docker Desktop, puis ouvrez un terminal dans le dossier `SecureDesk`.

Sous Windows, vous pouvez simplement double-cliquer sur `DEMARRER_WINDOWS.bat`. La première construction peut prendre quelques minutes.

```bash
docker compose up --build
```

Attendez que les trois services soient démarrés, puis ouvrez :

- application : http://localhost:3000
- état de l’API : http://localhost:5000/api/health

Pour arrêter l’application :

```bash
docker compose down
```

Pour effacer également les données locales et recommencer à zéro :

```bash
docker compose down -v
```

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@securedesk.local` | `Admin123!` |
| Technicien | `technicien@securedesk.local` | `Tech123!` |
| Employé | `employe@securedesk.local` | `Employe123!` |

Ces comptes sont uniquement destinés à une démonstration locale. Changez tous les mots de passe et désactivez `SEED_DEMO` avant un déploiement réel.

## Lancement sans Docker

Vous devez avoir Node.js 20+ et MongoDB en fonctionnement.

### API

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Interface

Dans un deuxième terminal :

```bash
cd frontend
npm install
npm run dev
```

Ouvrez ensuite http://localhost:5173.

## Tests

```bash
cd backend
npm test

cd ../frontend
npm run build
```

## Structure

```text
SecureDesk/
├── backend/          API Node.js, Express et Mongoose
├── frontend/         interface React et Vite
├── docs/             cahier des charges, UML, sécurité et tests
├── DEMARRER_WINDOWS.bat
├── docker-compose.yml
└── README.md
```

## Important

Les audits de sécurité doivent être réalisés uniquement sur cette application locale ou sur un système pour lequel vous possédez une autorisation écrite.
