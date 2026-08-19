# 🌸 Link in Bio

Application web de type Link-in-bio : chaque utilisateur dispose d'une page publique personnalisée avec ses liens et son thème visuel.

## Stack

| Couche      | Technologie                                   |
|-------------|-----------------------------------------------|
| Backend     | Symfony 8, Doctrine ORM, PHP 8.5              |
| Frontend    | React 19, Vite, Tailwind CSS v4, Lucide Icons |
| Base de données | MySQL 8.4                                  |
| Auth        | Session cookie (`json_login`)                 |
| Hébergement | OVH Mutualisé (Apache + MySQL 8.4)            |

## Structure

```
link-in-bio/
├── backend/           # API Symfony 8
│   ├── migrations/    # Migrations Doctrine (à committer)
│   ├── src/           # Entity, Controller/Api, Repository, Command
│   ├── public/        # Front controller + .htaccess + app/ (build React)
│   │   └── app/       # Build React (statique, commité)
│   └── .env           # Config par défaut (dev, MySQL local)
├── frontend/          # SPA React (Vite) → build dans backend/public/app/
├── .github/workflows/ # CI/CD : build + déploiement OVH auto
├── docker/            # Dockerfile PHP + vhost Apache
├── compose.yaml       # Stack dev (php + mysql 8.4)
├── deploy.sh          # Déploiement OVH
├── composer           # Binaire Composer versionné (indisponible sur OVH)
└── Makefile
```

## Développement local (Docker)

Prérequis : Docker + Docker Compose.

```bash
make up            # démarre php:8000 + mysql:3306
make composer      # composer install -d backend
make console cmd="doctrine:migrations:migrate --no-interaction"
make console cmd="doctrine:fixtures:load --no-interaction"

# Frontend (Node.js requis en local)
cd frontend && npm install && npm run dev   # dev server :5173 (proxy /api → :8000)
# ou : build statique servi par Apache via :8000/app/
cd frontend && npm run build
```

> L'API répond sur http://localhost:8000/api et le frontend buildé sur http://localhost:8000/app/.

### Comptes de démo (fixtures)

| Email                       | Mot de passe  | Profil        | Thème  |
|-----------------------------|---------------|---------------|--------|
| `demo@example.com`       | `password123` | `/app/louise` | rose   |
| `demo2@example.com`   | `password123` | `/app/partenaire` | ocean |

## Développement local (sans Docker)

PHP 8.5+ avec `pdo_mysql` + MySQL 8.4, Node.js 18+.

```bash
cd backend && composer install
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:fixtures:load --no-interaction
php -S 127.0.0.1:8000 -t public

cd frontend && npm install && npm run dev
```

## API Routes

## API Routes

### Publiques

| Méthode | Route                                | Description                  |
|---------|--------------------------------------|------------------------------|
| `GET`   | `/api/public`                        | Liste des profils publics    |
| `GET`   | `/api/public/{slug}`                 | Profil + liens actifs        |
| `POST`  | `/api/public/{slug}/click/{linkId}`  | Tracker un clic              |
| `GET`   | `/api/themes`                        | Liste des thèmes disponibles |
| `GET`   | `/api/social-networks`               | Liste des réseaux sociaux (type + template d'URL) |

### Admin (auth requise)

| Méthode  | Route                                           | Description          |
|----------|-------------------------------------------------|----------------------|
| `POST`   | `/api/login`                                    | Connexion            |
| `POST`   | `/api/logout`                                   | Déconnexion          |
| `GET`    | `/api/me`                                       | Utilisateur courant  |
| `GET`    | `/api/admin/profiles`                           | Mes profils          |
| `PUT`    | `/api/admin/profiles/{id}`                      | Modifier profil      |
| `GET`    | `/api/admin/profiles/{pid}/links`               | Lister liens         |
| `POST`   | `/api/admin/profiles/{pid}/links`               | Créer lien           |
| `PUT`    | `/api/admin/profiles/{pid}/links/reorder`       | Réordonner           |
| `PUT`    | `/api/admin/profiles/{pid}/links/{id}`          | Modifier lien        |
| `DELETE` | `/api/admin/profiles/{pid}/links/{id}`          | Supprimer lien       |

## Thèmes

4 thèmes prédéfinis (`frontend/src/themes/` + endpoint `/api/themes`) :

| Nom     | Label       | Ambiance                       |
|---------|-------------|--------------------------------|
| dark    | Midnight    | Sombre, violet, glassmorphism  |
| rose    | Blossom     | Rose pastel, doux              |
| ocean   | Ocean       | Bleu profond → cyan            |
| sunset  | Golden Hour | Orange/corail, chaleureux      |

## Notes techniques

- `doctrine/orm` est épinglé à `<3.6.8` : la version 3.6.8 exige `doctrine/dbal ^4.5`, non encore sorti en stable. Revenir à `^3.6` (ou passer à DBAL 4.5) dès que compatible.
- Les migrations sont générées via `doctrine:migrations:diff` ; elles doivent être commitées pour le déploiement OVH (le script ne fait que `migrate`).

## Licence

Projet privé.
