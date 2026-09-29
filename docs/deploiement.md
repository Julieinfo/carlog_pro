# CarLog Pro — déploiement (Render + Vercel)

Rédigé le 29 septembre 2026. Fournisseurs retenus dans `CLAUDE.md` (sections 2 et 8) : **Render** pour l'API Express, **Vercel** pour le frontend React/Vite, **MongoDB Atlas** pour les données. Replit reste l'environnement de Preview/développement (`.replit`). Rien n'a été déployé dans le cadre de cette préparation ; ce guide décrit ce qui est prêt dans le dépôt et ce qui reste à faire dans les dashboards.

## 1 · Fichiers de configuration présents

| Fichier | Rôle |
|---|---|
| `render.yaml` | Blueprint Render du service `carlog-pro-api` : `rootDir: backend`, `npm ci`, `node src/server.js`, health check `/api/health`, région Francfort, plan gratuit, déploiement auto **uniquement si les checks GitHub passent** (`autoDeployTrigger: checksPass`). Secrets non inclus (`sync: false` / `generateValue`). |
| `frontend/vercel.json` | Projet Vite : `npm ci`, `npm run build`, sortie `dist/`, en-têtes de sécurité (nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy). |
| `backend/.env.example`, `frontend/.env.example` | Liste des variables attendues, sans valeur. |
| `backend/scripts/verifier-env.js` (`npm run check:env`) | Vérifie présence et forme des variables **sans afficher leur valeur** ; exécutable dans le shell Render avec `NODE_ENV=production`. |
| `.github/workflows/ci.yml` | Tests backend + build frontend + contrôle des fichiers `.env` à chaque push/PR (voir section 5). |

## 2 · Variables attendues (noms seulement — jamais de valeur dans Git, le chat ou les logs)

### Render — service `carlog-pro-api`

| Variable | Origine | Remarque |
|---|---|---|
| `NODE_ENV` | `render.yaml` (`production`) | Active trust proxy, messages d'erreur génériques, installation sans devDependencies. |
| `NODE_VERSION` | `render.yaml` (`22`) | Aligné sur la CI. |
| `MONGO_URI` | Dashboard Render (`sync: false`) | Utilisateur Atlas applicatif `readWrite` sur la base de production. |
| `JWT_SECRET` | Généré par Render (`generateValue: true`) | Personne n'a à le connaître. Le changer déconnecte toutes les sessions (7 jours). |
| `FRONTEND_URL` | Dashboard Render (`sync: false`) | Origine exacte Vercel, `https://…`, sans barre oblique finale (le backend la tolère désormais, mais autant être propre). |
| `PORT` | Injecté par Render | Ne pas définir. |

### Vercel — projet frontend

| Variable | Origine | Remarque |
|---|---|---|
| `VITE_API_URL` | Project Settings → Environment Variables (Production) | URL publique Render **suivie de `/api`**, ex. `https://carlog-pro-api.onrender.com/api`. Variable de build : redéployer après modification. |

Réglage obligatoire côté Vercel : **Root Directory = `frontend`** (le dépôt est un monorepo). Aucun secret backend n'a sa place dans Vercel : seules les variables `VITE_*` existent, et elles sont publiques dans le bundle.

### Atlas

- Utilisateur applicatif dédié (`readWrite` sur la base de production), différent de l'utilisateur de développement et de l'utilisateur de sauvegarde (`read`).
- Network Access : les IP sortantes du service Render (visibles dans son onglet *Connect*/*Outbound*) ; `0.0.0.0/0` seulement si la sauvegarde GitHub Actions (option A de `docs/sauvegarde.md`) est retenue.
- Trois bases physiquement distinctes : développement, test (`MONGO_URI_TEST`), production.

## 3 · Ordre de mise en service

1. Atlas : créer la base de production, l'utilisateur applicatif et l'accès réseau.
2. Render : *New → Blueprint* sur ce dépôt (branche `main`) ; saisir `MONGO_URI` et, provisoirement, `FRONTEND_URL` (à corriger à l'étape 4). Attendre le premier déploiement et vérifier `https://<service>.onrender.com/api/health` → `{"status":"ok"}`.
3. Vercel : importer le dépôt, Root Directory `frontend`, définir `VITE_API_URL` avec l'URL Render + `/api`, déployer.
4. Render : mettre `FRONTEND_URL` à l'origine Vercel définitive (ex. `https://carlog-pro.vercel.app`) ; le service redémarre.
5. Exécuter la section 4 ci-dessous, puis consigner le résultat dans `docs/validation-et-prochaines-etapes.md`.

## 4 · Vérifications après le premier déploiement (à exécuter, non réalisées à ce jour)

```bash
API=https://<service>.onrender.com
FRONT=https://<projet>.vercel.app

# HTTPS et HSTS sur l'API (Helmet envoie Strict-Transport-Security ; Render termine TLS)
curl -sSI "$API/api/health" | grep -iE '^(HTTP|strict-transport-security|x-content-type-options|content-security-policy)'
# Redirection HTTP -> HTTPS assurée par Render
curl -sSI "http://${API#https://}/api/health" | head -1

# CORS : l'origine Vercel est acceptée, une origine inconnue ne l'est pas
curl -sSI -X OPTIONS "$API/api/auth/connexion" -H "Origin: $FRONT" -H 'Access-Control-Request-Method: POST' | grep -i access-control-allow-origin
curl -sSI -X OPTIONS "$API/api/auth/connexion" -H 'Origin: https://attaquant.example' -H 'Access-Control-Request-Method: POST' | grep -ic access-control-allow-origin   # attendu : 0

# Erreurs génériques en production
curl -sS "$API/api/inexistant"                                            # {"message":"Ressource introuvable."}
curl -sS -X POST "$API/api/auth/connexion" -H 'Content-Type: application/json' -d '{'   # {"message":"Corps de requête JSON invalide."}

# Frontend : HTTPS, en-têtes de vercel.json, HSTS ajouté par Vercel
curl -sSI "$FRONT" | grep -iE '^(HTTP|strict-transport-security|x-frame-options|x-content-type-options)'

# Variables côté Render (shell du service) : noms et validité seulement
NODE_ENV=production npm run check:env
```

Puis, dans le navigateur : inscription d'une entreprise de test, connexion, actualisation de la page (session conservée), déconnexion. Vérifier dans les logs Render qu'aucune URI ni aucun secret n'apparaît (`Erreur MongoDB : <nom>` uniquement en cas de problème).

## 5 · Livraison

- La CI (`.github/workflows/ci.yml`) doit être verte avant tout merge vers `main` ; Render ne déploie que si les checks passent (`checksPass`).
- Fusion vers `main` uniquement après validation manuelle de Julie (`CLAUDE.md` §7).
- Retour arrière : Render → *Deploys* → *Rollback* sur le déploiement précédent ; Vercel → *Deployments* → *Promote to Production* sur une version antérieure.

## 6 · Points ouverts et décisions

| Sujet | État | Décision attendue |
|---|---|---|
| `/api-docs` (Swagger) accessible publiquement en production | Vérifié : répond 200 sans authentification. Pas de secret exposé, mais cartographie complète de l'API. `servers` pointe encore sur `http://localhost:5000`. | Garder public (valorisation portfolio) ou restreindre par variable d'environnement ; mettre le serveur Swagger en URL relative. |
| Plan Render gratuit | Le service s'endort après 15 min d'inactivité : première requête lente (~30–60 s). Le frontend affiche « serveur inaccessible » si le délai Axios expire. | Accepter pour la démo, ou plan payant / ping externe. |
| Prévisualisations Vercel (URL par branche) | Bloquées par CORS car `FRONTEND_URL` est une origine unique. | Accepter, ou faire évoluer `FRONTEND_URL` en liste d'origines. |
| GitHub Pages | Activé sur `main` (racine) et publie le contenu du dépôt sur `https://julieinfo.github.io/carlog_pro/`. Aucun secret exposé (tout est déjà public), mais probablement involontaire. | Désactiver dans Settings → Pages, ou l'assumer. |
| Node.js | CI et Render sur Node 22 ; aucune contrainte `engines` dans les `package.json`. | Ajouter `engines` si l'on veut verrouiller la version. |
