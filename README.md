# CarLog Pro

Application web de gestion de flotte pour petites entreprises. Le MVP permet de gérer les véhicules, les alertes, les affectations et les utilisateurs d'une entreprise avec authentification et isolation multi-tenant.

> Projet de formation et portfolio. Les phases 0 à 8 sont déclarées terminées ; les recommandations d'amélioration et obligations préalables à une mise en service commerciale restent suivies séparément.

## Fonctionnalités disponibles

- Création d'un compte entreprise et d'un administrateur, connexion JWT et restauration de session.
- Gestion des véhicules : liste paginée, recherche, filtres, création, modification et archivage.
- Gestion des alertes : signalement, consultation, filtres, résolution et suppression selon le rôle.
- Affectations véhicule/conducteur : création, vérification des conflits, modification, clôture et kilométrage.
- Vue d'ensemble avec indicateurs de flotte.
- Gestion admin des utilisateurs : création, consultation, modification, désactivation et réactivation. Les parcours manuels de recette sont suivis dans `docs/validation-et-prochaines-etapes.md`.
- Contrôle d'accès selon les rôles `admin`, `fleet_manager`, `conducteur`, `mecanicien` et `comptable`.

## Architecture

| Partie | Technologies | Dossier |
|---|---|---|
| Frontend | React, Vite, Axios | `frontend/` |
| API | Node.js, Express, express-validator | `backend/` |
| Données | MongoDB, Mongoose | modèles dans `backend/src/models/` |
| Tests API | Jest, Supertest | `backend/src/tests/` |

L'API REST est organisée en routes, contrôleurs, middlewares et modèles. Les routes métier filtrent les données par entreprise depuis l'utilisateur authentifié. La documentation Swagger est disponible sur `/api-docs` lorsque l'API tourne.

## Démarrage local

Prérequis : Node.js et une instance MongoDB accessible.

1. Installer les dépendances :

   ```bash
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Configurer `backend/.env` avec `MONGO_URI` et `JWT_SECRET`. En production, définir aussi `FRONTEND_URL`. Garder les secrets côté backend.

3. Lancer l'API et le frontend dans deux terminaux :

   ```bash
   npm --prefix backend start
   npm --prefix frontend run dev
   ```

Le backend utilise le port `5000` par défaut. Vite utilise `5173` et relaie `/api` vers `http://127.0.0.1:5000`. `VITE_API_URL` peut remplacer la base API lorsque frontend et backend sont hébergés séparément. `GET /api/health` permet de vérifier l'API.

## Tests et build

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Les suites d'intégration nécessitent `backend/.env.test` avec `MONGO_URI_TEST` pointant vers une base de test dédiée, séparée des bases de développement et de production.
La CI GitHub Actions reprend ces deux contrôles avec une instance MongoDB éphémère ; elle ne requiert aucun secret de production ni secret Atlas.

## État du projet

Le MVP est implémenté et les phases 0 à 8 sont terminées selon les validations de Julie. La phase 7 couvre la CI GitHub, le déploiement Render/Vercel et les sauvegardes Atlas M0 vers OneDrive ; la phase 8 couvre les vérifications de qualité et la livraison. Les améliorations continues et obligations liées à une éventuelle mise en service commerciale restent dans le backlog. Voir [le guide de déploiement](docs/deploiement-production.md) et la [checklist de validation](docs/validation-et-prochaines-etapes.md).

La checklist de validation et l'ordre de travail restant sont dans [`docs/validation-et-prochaines-etapes.md`](docs/validation-et-prochaines-etapes.md). Le dossier PDF conserve son contenu initial ; une copie actualisée avec une synthèse des statuts est jointe sous `docs/CarLog_projet_maj_2026-09.pdf`.

## Hors périmètre actuel

Confirmation d'adresse email et récupération de compte sont explicitement hors MVP. Application mobile native, Stripe et paiements, autres notifications email, PWA, géolocalisation active, exports comptables avancés et maintenance prédictive sont des pistes ultérieures, pas des prérequis du MVP actuel.
