# CarLog Pro sur Replit

## Ecrans disponibles

- Vue d'ensemble : KPI, repartition des vehicules, vehicules et alertes recentes.
- Vehicules : liste paginee, recherche, filtres, ajout, modification et archivage.
- Alertes : liste, filtres, signalement et resolution. La suppression est reservee a l'administrateur.
- Affectations : liste, creation, modification et cloture avec kilometrage de fin.
- Utilisateurs : disponible pour l'administrateur, avec creation et desactivation des comptes de son entreprise.

Les donnees sont chargees depuis l'API Express et MongoDB. Aucun jeu de donnees fictif permanent n'est utilise.

## Roles et permissions

- `admin` : gestion complete de l'entreprise, des vehicules, utilisateurs, alertes et affectations.
- `fleet_manager` : gestion des vehicules, alertes et affectations ; lecture des utilisateurs pour choisir un conducteur.
- `conducteur` : lecture de ses affectations et de ses vehicules affectes ; creation d'alertes.
- `mecanicien` : lecture des donnees accessibles et traitement des alertes de maintenance.
- `comptable` : aucune action de gestion n'est affichee dans cette premiere version.

L'API reste la source d'autorisation : masquer un bouton dans React ne remplace pas les middlewares JWT et role du backend.

## Isolation et abonnements

Chaque requete metier utilise l'entreprise issue du JWT. Les references vehicule et conducteur sont verifiees dans cette meme entreprise, et les comptes desactives sont refuses par le middleware d'authentification.

- `trial` et `active` : acces autorise.
- `past_due` et `canceled` : acces API protege bloque avec une reponse 403.

Les affectations actives utilisent une transaction MongoDB, une mise a jour du statut du vehicule et des index uniques conditionnels pour eviter une double affectation concurrente.

## Lancement

Depuis la racine du projet :

```bash
npm --prefix backend start
npm --prefix frontend run dev -- --host 0.0.0.0
```

Le workflow `.replit` lance les deux services. Pour une installation propre :

```bash
cd frontend
npm ci
npm run build
```

Cette configuration sert au développement et à la Preview : elle lance Vite et `nodemon`. Elle ne constitue pas à elle seule une configuration de déploiement de production ; le fournisseur de production et ses paramètres HTTPS doivent encore être choisis et vérifiés avant publication.

L'endpoint public de verification technique est `GET /api/health` et renvoie uniquement `{ "status": "ok" }`.
Le frontend Vite ecoute sur le port 5173 par defaut, ou sur le premier port disponible si celui-ci est deja occupe. `VITE_PORT` permet de definir un autre port sans modifier le code.

Les tests backend existants se lancent avec :

```bash
cd backend
npm test -- --runInBand
```

## Variables necessaires

A renseigner dans les Secrets Replit ou dans les fichiers d'environnement locaux ignores par Git :

- `MONGO_URI`
- `JWT_SECRET`
- `PORT` (facultatif, 5000 par defaut)
- `FRONTEND_URL` en production pour le CORS
- `VITE_API_URL` (facultatif ; le frontend utilise `/api` par defaut)
- `MONGO_URI_TEST` (necessaire avant d'ajouter les tests d'integration multi-tenant)

Les valeurs des secrets ne doivent pas etre commitees ni affichees dans les logs.

## Validations realisees

- `npm ci` frontend sans option de contournement.
- `npm run build` frontend.
- `npm test -- --runInBand` backend : 12 tests passent apres le durcissement JWT et API.
- Chargement de l'application Express avec MongoDB et JWT configures.
- Verification de syntaxe des controleurs et routes modifies.
- `npm audit` retourne 0 vulnerabilite apres la correction du lockfile backend.

## Limites connues

- Les scenarios fonctionnels complets entre deux entreprises et tous les roles restent a executer manuellement avec des comptes de test dedies.
- Les tests d'integration multi-tenant necessitent encore une variable `MONGO_URI_TEST` pointant vers une base dediee ; ils ne doivent pas utiliser la base de developpement ou de production.
- La capture d'aperçu Replit n'a pas ete realisee dans cette session.
- Le choix du kilometrage final utilise encore une invite navigateur simple ; il pourra etre remplace par un formulaire integre plus tard.
- Les tests d'integration qui ecrivent en base doivent encore etre executes sur une base dediee via `MONGO_URI_TEST`.
