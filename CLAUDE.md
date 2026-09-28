# CLAUDE.md · CarLog Pro

> Ce fichier est la mémoire du projet. Claude Code le lit à chaque session : c'est ce qui transforme un outil générique en développeur qui connaît CarLog Pro. À garder à jour.

---

## 1 · Le contexte

- **Projet :** CarLog Pro — SaaS de gestion de flotte automobile, pour entreprises et particuliers qui gèrent des véhicules (maintenance, alertes, conducteurs)
- **Ce que l'app fait :** inscription entreprise + admin, gestion du parc véhicules, alertes (maintenance, carburant, sécurité, géofencing, administratif), affectations véhicule/conducteur, stats de flotte (dashboard)
- **Utilisateurs :** comptes entreprise avec rôles (admin, fleet_manager, conducteur, mecanicien, comptable) + comptes particuliers. Isolation multi-tenant stricte entre entreprises
- **Développeuse :** Julie De Castro, étudiante en L3 informatique (UPPA). Projet personnel pour GitHub / valorisation CV. Objectif alternance septembre 2027
- **Langue de l'interface :** français

## 2 · La stack (ne pas dévier sans me demander)

- **Backend :** Node.js + Express
- **Base de données :** MongoDB Atlas + Mongoose
- **Authentification :** JWT (7 jours) + bcryptjs (coût 12)
- **Frontend :** React.js (Vite)
- **Documentation API :** Swagger (swagger-jsdoc + swagger-ui-express, `/api-docs`)
- **Tests :** Jest + Supertest
- **Validation :** express-validator
- **Déploiement :** Render (backend) + Vercel (frontend)
- **Paiement (à venir) :** Stripe

Deux règles qui évitent des soirées perdues :

- Pas de nouvelle dépendance sans me l'annoncer et me dire pourquoi.
- **Isolation multi-tenant obligatoire.** Chaque requête filtre par `entreprise`, toujours pris depuis `req.user` (issu du JWT), jamais depuis le `body` ou les paramètres d'URL envoyés par le client.

## 3 · Comment on travaille ensemble

- Parle-moi en français, simplement.
- Avant de coder une feature : reformule ce que tu as compris en 3 lignes max, puis attends mon OK.
- Une feature à la fois. Petits pas, testables immédiatement.
- Quand quelque chose casse : je te colle l'erreur, tu répares, tu m'expliques en une phrase ce que c'était.
- Avant d'ajouter, regarde ce qui existe déjà : réutilise le contrôleur, le middleware ou le composant en place plutôt que d'en créer un deuxième.
- Fais ce que je demande, pas ce qui serait bien en plus. Pas de refonte spontanée, pas de renommage de fichiers non concernés.
- À la fin de chaque session : propose-moi de sauvegarder sur GitHub et mets à jour le journal (section 7).

## 4 · Direction artistique

- **Personnalité de la marque :** Professionnelle, fiable, axée sur la performance et la précision automobile.
- **Couleur principale (Marque & CTA) :** #DC2626 (Rouge Vif Automobile — uniquement logo, boutons d'action principaux "CTA", états actifs de navigation).
- **Couleur secondaire (Structure) :** #0F172A (Bleu Ardoise Foncé — texte principal, sidebar de navigation, cadre sérieux/B2B).
- **Couleur d'accent (Neutral) :** #475569 (Gris Ardoise — icônes secondaires, texte d'explication).
- **Fond / surfaces :** Fond clair #F8FAFC (gris chirurgical/propre), cartes blanches #FFFFFF avec ombre légère pour détacher les indicateurs de la flotte.
- **Statuts UI (crucial pour CarLog Pro) :**
  - 🟢 Succès (véhicule disponible / inspecté) : #10B981
  - ⚠️ Alerte / Warning (maintenance proche, carburant bas) : #F59E0B
  - 🔴 Erreur / Urgence (panne, géofencing franchi, document expiré) : #EF4444 (distinct du rouge marque, pour ne jamais confondre un bouton et une erreur)
- **Typo titres :** Inter, Sans-serif (600-700)
- **Typo texte :** Inter, Sans-serif (400-500)
- **Rayons (border-radius) :** 8px (cartes, boutons, inputs)
- **Interdits :** pas de mode sombre par défaut (fatiguant pour la saisie de données de flotte en journée), pas de dégradés sur les boutons, pas plus de 10% de rouge visible à l'écran en même temps.

Règle : chaque nouvel écran React respecte ces tokens. Si un écran a besoin d'un style qui n'existe pas ici, tu me le proposes AVANT.

**⚠️ Le `styles.css` actuel est en mode sombre (`--bg-dark`, cartes `#18181c`, texte blanc) — en contradiction directe avec cette DA (fond clair, pas de dark mode par défaut). Refonte du CSS existant à planifier comme tâche explicite avant de styler tout nouvel écran, pour ne pas avoir un mélange d'écrans clairs et sombres.**

## 5 · Sécurité (non négociable)

1. **Connecté ne veut pas dire autorisé.** Chaque route vérifie `protect` (JWT valide) **et** `authorize(...)` si le rôle doit être restreint. L'`entrepriseId` vient toujours de `req.user.entreprise` (token), jamais du body ou de l'URL — c'est la faille n°1 en multi-tenant : un utilisateur qui changerait un ID pour lire les données d'une autre entreprise.

2. **Base verrouillée.** Filtrage `entreprise` systématique sur toutes les requêtes Mongoose (find, findById + vérification, update, delete). Un modèle sans filtre entreprise devient accessible à tous le jour où un ID fuite.

3. **Aucun secret dans le code ni sur GitHub.** `MONGO_URI`, `JWT_SECRET` vivent dans `.env` / `.env.test`, tous deux dans `.gitignore`. Un secret poussé une fois doit être **révoqué**, pas seulement supprimé.

4. **Validation côté serveur** de toute donnée entrante (express-validator), même si le frontend valide déjà. Ce qui n'est vérifié que dans le navigateur n'est pas vérifié.

5. **Whitelist des champs modifiables.** Sur les `PUT`, on extrait explicitement les champs autorisés (déjà en place sur véhicules/alertes/affectations) — jamais `req.body` passé tel quel à `findByIdAndUpdate`, pour empêcher l'injection de champs comme `entreprise`, `role`, `resoluePar`.

6. **Ce qui coûte de l'argent ou peut être abusé est limité (rate limiting).**
   - `POST /api/auth/inscription` et `POST /api/auth/connexion` : limiter par IP (ex. `express-rate-limit`, 10 tentatives / 15 min).
   - Connexion : après 5 échecs sur le même email, ralentir ou bloquer temporairement ce compte (pas seulement l'IP, pour éviter le bourrage sur un compte ciblé).
   - Toute route d'envoi d'email (à venir) : limiter par compte et par heure.
   - Ne jamais annoncer publiquement les seuils exacts dans les messages d'erreur retournés au client.

7. **Mini-audit à chaque feature qui touche des données :** « qu'est-ce qu'un attaquant pourrait faire avec ça (accéder aux données d'une autre entreprise, escalader son rôle) ? ». Tu corriges avant de me montrer.

## 6 · Conventions API

**Format des réponses succès** — à uniformiser sur toutes les routes (actuellement incohérent : `getVehicules` renvoie `{pagination, data}`, d'autres renvoient un tableau ou un objet brut) :

```json
// Liste paginée
{ "data": [...], "pagination": { "totalItems": 0, "totalPages": 0, "currentPage": 1, "itemsPerPage": 10 } }

// Liste simple (pas de pagination)
{ "data": [...] }

// Ressource unique
{ "data": { ... } }

// Action sans retour de ressource (delete, etc.)
{ "message": "..." }
```

**Format des erreurs** — à uniformiser (actuellement `{message}` et `{erreurs: [...]}` coexistent sans règle) :

```json
// Erreur simple (métier, 400/401/403/404/500)
{ "message": "Description claire pour l'utilisateur." }

// Erreur de validation (express-validator, 400)
{ "message": "Données invalides.", "erreurs": [ { "champ": "email", "message": "Le format de l'email est invalide." } ] }
```

- Codes HTTP : 200 (succès), 201 (création), 400 (validation/métier), 401 (non authentifié), 403 (authentifié mais rôle/accès refusé), 404 (introuvable ou appartient à une autre entreprise — ne jamais distinguer les deux dans le message), 500 (erreur serveur imprévue).
- Ne jamais renvoyer la stack trace ou `err.message` brut d'une erreur Mongoose/Mongo au client en production — logger côté serveur, renvoyer un message générique.
- Une route existante qui ne suit pas encore ce format n'est pas à corriger en masse spontanément : on l'aligne quand on la touche pour autre chose, feature par feature.

## 7 · Git / Workflow

- **Branches :** `main` (stable, déployable) · `dev` (intégration) · `feature/nom-court` pour chaque feature. Jamais de commit direct sur `main`.
- **Commits :** message court à l'impératif, en français, préfixé par type : `feat:`, `fix:`, `sec:` (correctif sécurité), `refacto:`, `docs:`, `test:`. Ex. `feat: ajout pagination alertes`.
- **Un commit = un sujet.** Pas de commit qui mélange une feature et un renommage de fichiers sans rapport.
- **Avant de pousser :** tests Jest passent, pas de `console.log` de debug oublié, pas de secret en clair.
- **Merge vers `main`** uniquement après validation manuelle par Julie (pas d'auto-merge décidé par l'IA).

## 8 · Environnements

| | Local (dev) | Test (Jest) | Production |
|---|---|---|---|
| Backend | `localhost:5000` | `NODE_ENV=test` | Render |
| Frontend | `localhost:5173` | — | Vercel |
| Base de données | MongoDB Atlas (dev) | MongoDB Atlas (base test dédiée) | MongoDB Atlas (prod) |
| Variables d'env | `backend/.env` | `backend/.env.test` | Render (dashboard, jamais en dur) |
| CORS autorisé | `localhost:3000/5173`, `127.0.0.1` équivalents | — | `FRONTEND_URL` (Vercel), défini via variable d'env Render |

- La base de test (`.env.test`) doit être **physiquement différente** de la base de dev/prod — jamais la même URI avec juste un `NODE_ENV` qui change, sinon un test mal nettoyé pollue les vraies données.
- Toute nouvelle variable d'env : l'ajouter dans `.env.example` (sans valeur réelle) pour que la doc reste à jour, et me dire de l'ajouter dans Render/Vercel.

## 9 · Definition of done

Une feature est finie quand :

- [ ] `npm run build` (frontend) et les tests Jest passent **en local**
- [ ] Elle marche avec l'API en environnement de test, pas seulement en dev
- [ ] Elle respecte la DA (section 4)
- [ ] Elle respecte la sécurité (section 5), **testée avec un compte d'une autre entreprise et/ou un rôle non autorisé**
- [ ] Elle respecte les conventions API (section 6) pour toute route touchée
- [ ] Les cas vides, le chargement et les erreurs sont traités côté frontend
- [ ] Je l'ai testée moi-même avec une vraie donnée
- [ ] Le journal (section 10) est à jour

## 10 · Journal du projet

> Ajoute une ligne ici à chaque session. Date · ce qui a été fait · ce qui reste.

- [2026-09] · Backend terminé (auth, CRUD véhicules/alertes/affectations, stats, RBAC, Swagger, tests Jest) · Frontend React en cours (dashboard connecté à l'API)
- [2026-09] · Phase 1 — 43 tests backend passent sur la base de test ; isolation, RBAC, auth, secrets et affectations concurrentes vérifiés. Correction : un conducteur ne peut consulter que ses propres affectations ; les erreurs MongoDB internes ne divulguent plus leur message en production · validation manuelle acceptée par Julie le 28 septembre 2026.
- [2026-09] · RBAC suppressions — suppression des alertes réservée à admin et fleet_manager ; suppression des affectations réservée à admin. Matrice vérifiée sur les cinq rôles.
- [2026-09] · Phase 2 — session frontend vérifiée via `/auth/me` au montage ; 401 déconnecte et notifie le contexte, hors échec de connexion. Messages d’erreur API uniformisés dans les formulaires.
- [2026-09] · Contrat d’authentification — `/auth/me` renvoie les six mêmes champs `user` que l’inscription et la connexion ; test d’intégration ajouté pour comparer exactement les clés.
- [2026-09] · Inscription réelle — formulaire entreprise collecte SIRET, téléphone et adresse ; validation frontend/backend des formats SIRET/code postal, sans valeurs générées.
- [2026-09] · Validation PTAC — valeur minimale portée à 1 kg dans le modèle, les validateurs de création/modification et le formulaire ; tests ajoutés pour PTAC absent, nul et valide.
- [2026-09] · Phase 4 — modification et suppression d’affectation synchronisent les statuts véhicule dans une transaction ; les conducteurs ne voient que les alertes de leurs véhicules affectés en cours.
- [2026-09] · Phase 5 — gestion des utilisateurs : édition, promotion de rôles, contrôle d’unicité de l’email et réactivation ajoutés ; ces opérations sont réservées aux admins, avec blocage de la modification du rôle et du statut de son propre compte. Les rôles sont libellés en français dans l’interface, les secrets restent exclus des réponses.
- [2026-09] · Phase 5 — statut reporté pour ce jalon selon la demande de Julie : modification et réactivation ne sont pas comptabilisées comme livrées. Leur implémentation existe toutefois déjà dans le code courant ; ne pas supprimer ces fonctions sans demande explicite.
- [2026-09] · Formulaire utilisateurs — désactivation de l’autocomplétion sur la création de compte et indication explicite d’un nouveau mot de passe pour éviter le préremplissage des identifiants enregistrés par le navigateur.
- [2026-09] · Phase 7 démarrée — motifs `.env`/`.env.test` séparés dans le `.gitignore` racine ; aucun fichier `.env` n’est suivi ou présent dans l’historique Git vérifié. Arrêt propre sur `SIGTERM`/`SIGINT` ajouté avec fermeture HTTP puis MongoDB, délai de sécurité de 10 s et tests unitaires.
- [2026-09] · Phase 7 sécurité API — Helmet, limite JSON 100 kb, proxy approuvé uniquement en production, limiteurs IP sur connexion/inscription et verrouillage temporaire après cinq échecs. Le verrouillage peut être déclenché par un tiers contre une adresse connue (indisponibilité de 15 min), compromis accepté ; limites mémoire et tests unitaires ajoutés. La modification et la réactivation d’utilisateurs restent reportées.
- [2026-09] · Abonnements SaaS — `trial`/`active` accès complet ; `past_due` lecture seule avec création d’alertes toujours permise ; `canceled` bloque les utilisateurs et limite l’admin à la lecture de `/auth/me` et `/auth/entreprise`. Le statut `abonnement` est présent dans les trois réponses d’authentification, une bannière et un écran suspendu sont affichés. Aucun utilisateur ne peut modifier le statut, la formule ou l’activité de l’entreprise via l’API ; jusqu’à Stripe, la régularisation reste manuelle dans MongoDB Atlas. Les trois états et leurs restrictions ont été vérifiés manuellement.
- [2026-09] · Vérification backend — suite complète exécutée avec accès réseau à MongoDB Atlas : 17 suites et 84 tests passent sur la base dédiée `carlog_pro_test`. L’exécution dans la sandbox échouait avec `EACCES` sur les connexions réseau ; aucun changement de configuration ou de secret n’a été nécessaire.
- [2026-09] · Phase 7 — sauvegarde/restauration validée sur M0 : dump temporaire de `carlog_pro_test` avec MongoDB Database Tools 100.19.0, puis restauration dans `carlog_pro_restore_check_20260928`. Les 5 collections ont été comparées par nombre de documents, sans différence. Cette vérification ne définit pas encore une sauvegarde durable, sa destination ni sa rétention ; les sauvegardes Atlas natives ne sont pas disponibles pour le cluster Free/M0.
- [2026-09] · Phase 1 acceptée — Julie confirme que tous les contrôles manuels listés dans la checklist (auth/JWT, compte inactif, isolation multi-entreprises, RBAC des cinq rôles et entreprise issue du JWT) ont été réalisés.

## 11 · Pièges connus

| Symptôme | Cause réelle | Règle |
|---|---|---|
| Un utilisateur voit les données d'une autre entreprise | `entreprise` pris depuis le body/URL au lieu de `req.user.entreprise` | Toujours filtrer depuis le token décodé |
| Un champ interdit (`entreprise`, `role`, `resoluePar`) est modifié via l'API | `req.body` passé tel quel à `findByIdAndUpdate` | Toujours passer par une whitelist explicite de champs |
| Connexion MongoDB Atlas échoue en DNS | URI SRV mal résolue | Utiliser l'URI longue (sans SRV) en dépannage |
| Les variables d'environnement sont vides en local | `.env` / `.env.test` non chargés ou mal nommés | Vérifier `dotenv.config()` et le `NODE_ENV` utilisé |
| Double hash du mot de passe | Hook `pre('save')` déclenché même sans modification du mot de passe | Toujours vérifier `isModified('motDePasse')` avant de hasher |
| Erreur 500 avec message Mongo brut affiché à l'utilisateur | `err.message` renvoyé tel quel au lieu d'un message générique | Logger l'erreur serveur, renvoyer un message générique en prod |

- [ajoute les tiens ici]

---

*Adapté du starter CLAUDE.md générique pour coller au projet réel CarLog Pro (Express/MongoDB/React, SaaS B2B de gestion de flotte).*
