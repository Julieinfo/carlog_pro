# CLAUDE.md · CarLog Pro

> Ce fichier est la mémoire du projet. Claude Code le lit à chaque session : c'est ce qui transforme un outil générique en développeur qui connaît CarLog Pro. À garder à jour.

---

## 1 · Le contexte

- **Projet :** CarLog Pro - SaaS de gestion de flotte automobile, pour entreprises et particuliers qui gèrent des véhicules (maintenance, alertes, conducteurs)
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
- **Couleur principale (Marque & CTA) :** #DC2626 (Rouge Vif Automobile - uniquement logo, boutons d'action principaux "CTA", états actifs de navigation).
- **Couleur secondaire (Structure) :** #0F172A (Bleu Ardoise Foncé - texte principal, sidebar de navigation, cadre sérieux/B2B).
- **Couleur d'accent (Neutral) :** #475569 (Gris Ardoise - icônes secondaires, texte d'explication).
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

**⚠️ Le `styles.css` actuel est en mode sombre (`--bg-dark`, cartes `#18181c`, texte blanc) - en contradiction directe avec cette DA (fond clair, pas de dark mode par défaut). Refonte du CSS existant à planifier comme tâche explicite avant de styler tout nouvel écran, pour ne pas avoir un mélange d'écrans clairs et sombres.**

## 5 · Sécurité (non négociable)

1. **Connecté ne veut pas dire autorisé.** Chaque route vérifie `protect` (JWT valide) **et** `authorize(...)` si le rôle doit être restreint. L'`entrepriseId` vient toujours de `req.user.entreprise` (token), jamais du body ou de l'URL - c'est la faille n°1 en multi-tenant : un utilisateur qui changerait un ID pour lire les données d'une autre entreprise.

2. **Base verrouillée.** Filtrage `entreprise` systématique sur toutes les requêtes Mongoose (find, findById + vérification, update, delete). Un modèle sans filtre entreprise devient accessible à tous le jour où un ID fuite.

3. **Aucun secret dans le code ni sur GitHub.** `MONGO_URI`, `JWT_SECRET` vivent dans `.env` / `.env.test`, tous deux dans `.gitignore`. Un secret poussé une fois doit être **révoqué**, pas seulement supprimé.

4. **Validation côté serveur** de toute donnée entrante (express-validator), même si le frontend valide déjà. Ce qui n'est vérifié que dans le navigateur n'est pas vérifié.

5. **Whitelist des champs modifiables.** Sur les `PUT`, on extrait explicitement les champs autorisés (déjà en place sur véhicules/alertes/affectations) - jamais `req.body` passé tel quel à `findByIdAndUpdate`, pour empêcher l'injection de champs comme `entreprise`, `role`, `resoluePar`.

6. **Ce qui coûte de l'argent ou peut être abusé est limité (rate limiting).**
   - `POST /api/auth/inscription` et `POST /api/auth/connexion` : limiter par IP (ex. `express-rate-limit`, 10 tentatives / 15 min).
   - Connexion : après 5 échecs sur le même email, ralentir ou bloquer temporairement ce compte (pas seulement l'IP, pour éviter le bourrage sur un compte ciblé).
   - Toute route d'envoi d'email (à venir) : limiter par compte et par heure.
   - Ne jamais annoncer publiquement les seuils exacts dans les messages d'erreur retournés au client.

7. **Mini-audit à chaque feature qui touche des données :** « qu'est-ce qu'un attaquant pourrait faire avec ça (accéder aux données d'une autre entreprise, escalader son rôle) ? ». Tu corriges avant de me montrer.

## 6 · Conventions API

**Format des réponses succès** - à uniformiser sur toutes les routes (actuellement incohérent : `getVehicules` renvoie `{pagination, data}`, d'autres renvoient un tableau ou un objet brut) :

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

**Format des erreurs** - à uniformiser (actuellement `{message}` et `{erreurs: [...]}` coexistent sans règle) :

```json
// Erreur simple (métier, 400/401/403/404/500)
{ "message": "Description claire pour l'utilisateur." }

// Erreur de validation (express-validator, 400)
{ "message": "Données invalides.", "erreurs": [ { "champ": "email", "message": "Le format de l'email est invalide." } ] }
```

- Codes HTTP : 200 (succès), 201 (création), 400 (validation/métier), 401 (non authentifié), 403 (authentifié mais rôle/accès refusé), 404 (introuvable ou appartient à une autre entreprise - ne jamais distinguer les deux dans le message), 500 (erreur serveur imprévue).
- Ne jamais renvoyer la stack trace ou `err.message` brut d'une erreur Mongoose/Mongo au client en production - logger côté serveur, renvoyer un message générique.
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
| Frontend | `localhost:5173` | - | Vercel |
| Base de données | MongoDB Atlas (dev) | MongoDB Atlas (base test dédiée) | MongoDB Atlas (prod) |
| Variables d'env | `backend/.env` | `backend/.env.test` | Render (dashboard, jamais en dur) |
| CORS autorisé | `localhost:3000/5173`, `127.0.0.1` équivalents | - | `FRONTEND_URL` (Vercel), défini via variable d'env Render |

- La base de test (`.env.test`) doit être **physiquement différente** de la base de dev/prod - jamais la même URI avec juste un `NODE_ENV` qui change, sinon un test mal nettoyé pollue les vraies données.
- Toute nouvelle variable d'env : l'ajouter dans `.env.example` (sans valeur réelle) pour que la doc reste à jour, et me dire de l'ajouter dans Render/Vercel.

## 9 · Definition of done

Une feature est finie quand :

- [ ] `npm run build` (frontend) et les tests Jest passent **en local**
- [x] Elle marche avec l'API en environnement de test, pas seulement en dev
- [x] Elle respecte la DA (section 4)
- [x] Elle respecte la sécurité (section 5), **testée avec un compte d'une autre entreprise et/ou un rôle non autorisé**
- [x] Elle respecte les conventions API (section 6) pour toute route touchée
- [x] Les cas vides, le chargement et les erreurs sont traités côté frontend
- [x] Je l'ai testée moi-même avec une vraie donnée
- [x] Le journal (section 10) est à jour

## 10 · Journal du projet

> Ajoute une ligne ici à chaque session. Date · ce qui a été fait · ce qui reste.

- [2026-09] · Backend terminé (auth, CRUD véhicules/alertes/affectations, stats, RBAC, Swagger, tests Jest) · Frontend React en cours (dashboard connecté à l'API)
- [2026-09] · Phase 1 - 43 tests backend passent sur la base de test ; isolation, RBAC, auth, secrets et affectations concurrentes vérifiés. Correction : un conducteur ne peut consulter que ses propres affectations ; les erreurs MongoDB internes ne divulguent plus leur message en production · validation manuelle acceptée par Julie le 28 septembre 2026.
- [2026-09] · RBAC suppressions - suppression des alertes réservée à admin et fleet_manager ; suppression des affectations réservée à admin. Matrice vérifiée sur les cinq rôles.
- [2026-09] · Phase 2 - session frontend vérifiée via `/auth/me` au montage ; 401 déconnecte et notifie le contexte, hors échec de connexion. Messages d’erreur API uniformisés dans les formulaires.
- [2026-09] · Contrat d’authentification - `/auth/me` renvoie les six mêmes champs `user` que l’inscription et la connexion ; test d’intégration ajouté pour comparer exactement les clés.
- [2026-09] · Inscription réelle - formulaire entreprise collecte SIRET, téléphone et adresse ; validation frontend/backend des formats SIRET/code postal, sans valeurs générées.
- [2026-09] · Validation PTAC - valeur minimale portée à 1 kg dans le modèle, les validateurs de création/modification et le formulaire ; tests ajoutés pour PTAC absent, nul et valide.
- [2026-09] · Phase 4 - modification et suppression d’affectation synchronisent les statuts véhicule dans une transaction ; les conducteurs ne voient que les alertes de leurs véhicules affectés en cours.
- [2026-09] · Phase 6 officiellement validée - Julie confirme que tous les contrôles du dashboard ont été réalisés : comparaison des KPI aux listes, vérification entre deux entreprises, vues admin/gestionnaire de flotte/comptable, et états de chargement, liste vide, erreur API et erreur dashboard.
- [2026-09] · Phase 5 - gestion des utilisateurs : édition, promotion de rôles, contrôle d’unicité de l’email et réactivation ajoutés ; ces opérations sont réservées aux admins, avec blocage de la modification du rôle et du statut de son propre compte. Les rôles sont libellés en français dans l’interface, les secrets restent exclus des réponses.
- [2026-09] · Décision de périmètre mise à jour par Julie : l'édition et la réactivation, déjà implémentées, sont officiellement incluses et livrées en phase 5. L'ancienne décision de report est remplacée.
- [2026-09] · Phase 5 officiellement validée - Julie confirme que tous les parcours de gestion des utilisateurs ont été réalisés : création, consultation, modification, désactivation et tentative de connexion après désactivation, réactivation et reconnexion ; les rôles sont présentés avec leurs libellés français.
- [2026-09] · Formulaire utilisateurs - désactivation de l’autocomplétion sur la création de compte et indication explicite d’un nouveau mot de passe pour éviter le préremplissage des identifiants enregistrés par le navigateur.
- [2026-09] · Phase 7 démarrée - motifs `.env`/`.env.test` séparés dans le `.gitignore` racine ; aucun fichier `.env` n’est suivi ou présent dans l’historique Git vérifié. Arrêt propre sur `SIGTERM`/`SIGINT` ajouté avec fermeture HTTP puis MongoDB, délai de sécurité de 10 s et tests unitaires.
- [2026-09] · Phase 7 sécurité API - Helmet, limite JSON 100 kb, proxy approuvé uniquement en production, limiteurs IP sur connexion/inscription et verrouillage temporaire après cinq échecs. Le verrouillage peut être déclenché par un tiers contre une adresse connue (indisponibilité de 15 min), compromis accepté ; limites mémoire et tests unitaires ajoutés.
- [2026-09] · Abonnements SaaS - `trial`/`active` accès complet ; `past_due` lecture seule avec création d’alertes toujours permise ; `canceled` bloque les utilisateurs et limite l’admin à la lecture de `/auth/me` et `/auth/entreprise`. Le statut `abonnement` est présent dans les trois réponses d’authentification, une bannière et un écran suspendu sont affichés. Aucun utilisateur ne peut modifier le statut, la formule ou l’activité de l’entreprise via l’API ; jusqu’à Stripe, la régularisation reste manuelle dans MongoDB Atlas. Les trois états et leurs restrictions ont été vérifiés manuellement.
- [2026-09] · Vérification backend - suite complète exécutée avec accès réseau à MongoDB Atlas : 17 suites et 84 tests passent sur la base dédiée `carlog_pro_test`. L’exécution dans la sandbox échouait avec `EACCES` sur les connexions réseau ; aucun changement de configuration ou de secret n’a été nécessaire.
- [2026-09] · Phase 7 - sauvegarde/restauration M0 : premier test du dump temporaire `carlog_pro_test` vers `carlog_pro_restore_check_20260928` ; les 5 collections avaient le même nombre de documents. Ce test antérieur était isolé de la production.
- [2026-09] · Phase 7 - déploiement et CI : Render et Vercel sont en production ; Julie confirme HTTPS, parcours frontend → API et CI GitHub verte. Le CORS a été résolu en configurant `NODE_ENV=production` et `FRONTEND_URL` côté Render ; `VITE_API_URL` pointe sur l'API Render avec le préfixe `/api`.
- [2026-09] · Sauvegardes Atlas M0 → OneDrive opérationnelles : outils MongoDB 100.19.0 installés ; archives quotidiennes vers `backups/atlas-m0` (ignoré par Git), rétention 7 dernières + jusqu'à 4 dimanches. La tâche Windows `CarLogProAtlasBackup` a réussi (`0x0`) le 29/09/2026 à 20:44 ; trois archives visibles avec coches vertes OneDrive. Julie confirme le test de restauration ainsi que les validations restantes de la phase 7. Les archives sont compressées sans chiffrement côté client et réservées aux données de démonstration.
- [2026-09] · Phase 1 acceptée - Julie confirme que tous les contrôles manuels listés dans la checklist (auth/JWT, compte inactif, isolation multi-entreprises, RBAC des cinq rôles et entreprise issue du JWT) ont été réalisés.
- [2026-09] · Phase 0 officiellement terminée - Julie confirme backend/frontend, ports, API de santé, Preview, erreurs de démarrage et vérification visuelle des thèmes clair/sombre.
- [2026-09] · Thème frontend - thème clair comme valeur initiale conforme à la DA, bouton de bascule clair/sombre disponible sur connexion, inscription et dashboard ; choix conservé dans `localStorage` et fonctionnement visuel confirmé par Julie.
- [2026-09] · Phase 2 officiellement validée - Julie confirme que les parcours d'inscription avec données entreprise, erreurs de connexion/API, restauration et expiration de session, déconnexion et protection du dashboard ont tous été réalisés dans Preview.
- [2026-09] · Phase 3 officiellement validée - Julie confirme que les parcours véhicules, validations, statuts, filtres/pagination, archivage, persistance, droits par rôle et vérification des informations de maintenance ont tous été réalisés.
- [2026-09] · Phase 4 officiellement validée - Julie confirme que les parcours alertes/affectations, conflits, synchronisation des statuts véhicule, suppression, filtrage conducteur, permissions des rôles et périmètre des filtres ont tous été réalisés.
- [2026-09-29] · Phase 8 officiellement terminée - Julie confirme que tous les contrôles de qualité et livrables de la phase (tests/build, parcours E2E, multi-entreprise et rôles, erreurs réseau/API, responsive, accessibilité, documentation et préparation de publication) ont été réalisés. La checklist de recette et le résumé du README sont synchronisés ; le backlog de recommandations post-MVP reste distinct.
- [2026-09-30] · Backlog d'exploitation - journaux API JSON filtrés des données sensibles, corrélation `X-Request-Id`/`CF-Ray`, contrôle `/api/health` incluant un ping MongoDB, Dependabot hebdomadaire pour npm et GitHub Actions, métadonnées SEO/favicon/Open Graph/robots/sitemap, et avertissement de démonstration pour n'utiliser que des données fictives. Les notifications Render et une sonde externe restent à activer dans les comptes d'hébergement.
- [2026-09-30] · Brouillon juridique factuel préparé dans `docs/brouillon-juridique.md`. Julie ne sait pas si son identité a été transmise à un hébergeur ; ne pas inventer ni publier son adresse. Confirmer l'option LCEN, les coordonnées exactes des hébergeurs, les régions de traitement et la conservation avant publication des notices finales.
- [2026-09-30] · Réparation du dépôt - 19 fichiers suivis avaient disparu du disque (dont le brouillon juridique, `favicon.svg`, `robots.txt` et trois utilitaires backend importés au démarrage) : restaurés depuis Git. Le dernier commit cassait aussi le démarrage : ligne dupliquée dans `arretPropre.js` (`SyntaxError`) et `middlewares/rateLimiters.js` perdu lors du merge `2b9225b`, absent de `main` et `origin/main`, restauré depuis `607e131`. Garde défensive ajoutée dans `journal.js` pour `req.get`. Suite backend de nouveau verte : 16 suites, 80 tests.
- [2026-09-30] · Pages légales provisoires - `frontend/src/pages/PagesLegales.jsx` contient les mentions légales, les CGU et la politique de confidentialité issues du brouillon factuel, accessibles publiquement par ancre (`#/mentions-legales`, `#/cgu`, `#/politique-confidentialite`) via `App.jsx`, sans nouvelle dépendance. `PiedDePageLegal.jsx` ajoute les liens sur connexion, inscription et dashboard. Les sept informations non confirmées sont marquées « À COMPLÉTER » et chaque page affiche un bandeau « Version provisoire » ; aucune adresse personnelle n'est publiée. Restent à trancher : statut LCEN et identité transmise aux hébergeurs, adresse légale de Render, mention éventuelle de MongoDB Atlas, régions et transferts hors UE, durées de conservation, base légale RGPD et droit applicable. Build frontend et recette visuelle non vérifiés en sandbox.
- [2026-09-30] · Textes légaux rédigés - les trois pages ont été écrites en entier : mentions légales en 8 sections (éditeur, directrice de la publication, objet, hébergement, anonymat LCEN, propriété intellectuelle, données personnelles, contact), CGU en 14 articles (objet, inscription, obligation de données fictives, identifiants, usage autorisé et interdit, disponibilité, responsabilité, désactivation, propriété intellectuelle, données, modification, droit applicable, contact) et politique de confidentialité en 14 sections avec un tableau des données, finalités et durées de conservation. Les faits non confirmés restent marqués « À COMPLÉTER » (7 points) ; la base légale RGPD et le droit applicable des CGU sont explicitement laissés à l'analyse de Julie, sans être tranchés à sa place. Contrôle syntaxique des 11 fichiers JSX réussi ; build et recette visuelle toujours à faire en local.

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

## 12 · Recommandations SaaS complémentaires

### Sécurité, authentification et données

- Les secrets restent dans les fichiers `.env` locaux ignorés par Git et dans les variables d'environnement du backend Render en production. Aucune clé privée ou URI MongoDB ne doit entrer dans le bundle frontend.
- Les mots de passe sont hachés côté serveur et ne sont jamais renvoyés par l'API. La validation serveur et les contrôles RBAC restent requis même quand l'interface masque une action.
- Toute requête métier est limitée à `req.user.entreprise`, obtenu du JWT. Aucun identifiant transmis par le client ne peut élargir l'accès à une autre entreprise.
- Les JWT expirent. Le stockage actuel du jeton dans `localStorage` implique un risque d'exposition en cas de faille XSS. Un passage aux cookies `HttpOnly` nécessiterait une évolution coordonnée du backend et du frontend ; ne pas le faire isolément.
- Le rate limiting et le verrouillage temporaire des connexions existent déjà ; les entrées continuent à être validées côté serveur.
- CORS reste limité aux origines attendues et HTTPS doit être vérifié au déploiement de production.
- La confirmation d'email et la récupération de compte sont formellement hors MVP, décision de Julie consignée le 28 septembre 2026. Ne pas les ajouter au périmètre MVP ; toute évolution ultérieure nécessite une nouvelle décision produit.
- Les webhooks signés ne seront ajoutés que si un prestataire de paiement tel que Stripe est intégré.
- Si des fichiers utilisateurs sont ajoutés, contrôler leur taille et leur type réel, et définir leur stockage avant la mise en ligne.
- Supabase/RLS, les clés `NEXT_PUBLIC_*`, le service-role Supabase et les fonctionnalités LLM ne correspondent pas à l'architecture actuelle (React, Express, MongoDB) et ne sont pas à ajouter sans décision produit.

### Base de données et performances

- Auditer les index des champs fréquemment recherchés, en particulier les références d'entreprise, véhicules, utilisateurs et affectations.
- Éviter les requêtes répétées dans les boucles et examiner les chargements de documents liés. Les listes susceptibles de grossir doivent être paginées : véhicules, alertes, affectations et utilisateurs.
- Les quotas par formule (véhicules, comptes, alertes) restent à définir seulement si la politique commerciale les prévoit. Les règles d'accès déjà décidées sont : `trial`/`active` accès complet, `past_due` lecture seule sauf création d'alerte, `canceled` accès restreint ; la réactivation reste manuelle jusqu'à Stripe.
- Documenter les évolutions de schéma Mongoose et prévoir un script de migration de données lorsqu'un changement de modèle l'exige. Les migrations SQL ne s'appliquent pas.
- N'ajouter du cache qu'après mesure d'un besoin, en tenant compte du risque de données désynchronisées.
- Les sauvegardes quotidiennes M0 vers OneDrive, leur rétention et le test de restauration sont en place ; vérifier périodiquement le résultat de la tâche, la synchronisation OneDrive et l'intégrité d'une archive.

### Interface et accessibilité

- Garder des états distincts de chargement, erreur API et liste vide ; confirmer à l'écran la réussite ou l'échec d'une action.
- Demander confirmation avant une opération destructive ou sensible, notamment la suppression et la désactivation.
- Garder les formulaires utilisables sur mobile et tablette, avec des champs lisibles et des erreurs compréhensibles. Vérifier navigation clavier, libellés accessibles et contrastes.
- Le thème clair est le thème initial conforme à la DA ; le bouton permet de basculer en mode sombre et le choix est conservé dans `localStorage`.
- L'affichage/masquage du mot de passe, les CTA marketing fixes, la recherche globale et le bouton de contact flottant sont à évaluer à partir d'un besoin constaté. Animations et contrôles de défilement restent facultatifs.

### Légal, confidentialité et référencement

- Avant une mise en service réelle, préparer les mentions légales, CGU et politique de confidentialité adaptées aux données de compte, d'entreprise, de véhicules, d'affectation et d'incidents.
- Inventorier les traceurs avant de mettre en place un bandeau cookies ; obtenir le consentement uniquement pour ceux qui le requièrent.
- Définir une procédure et des durées de conservation pour les demandes d'accès, rectification et suppression des données personnelles.
- Réserver le référencement aux pages publiques. Le tableau de bord privé n'a pas vocation à être indexé.
- Pour les pages publiques existantes, vérifier titres/descriptions, favicon, image de partage, `robots.txt` et sitemap selon le contenu réellement publiable. Les images informatives ont un texte `alt` pertinent.
- Les témoignages, avis et chiffres de clientèle doivent être réels et autorisés. FAQ, remerciements d'achat et autres pages commerciales ne sont ajoutés que s'ils servent un parcours existant.

### Qualité et exploitation

- Retirer les traces de débogage avant livraison ; garder les commentaires utiles à la maintenance.
- Suivre les dépendances et examiner les changements ; ne pas appliquer automatiquement les mises à jour majeures.
- Centraliser les erreurs de production sans journaliser secrets, mots de passe, JWT ou URI MongoDB. Mettre en place une alerte de disponibilité API et une surveillance des erreurs.
- Mesurer le chargement des listes et optimiser les images si le site en utilise. Vérifier les liens et parcours publics.
- Documenter les décisions d'abonnement et les changements de schéma.

### Ordre de priorité complémentaire

1. La politique de statut d'abonnement est cadrée et implémentée ; les plafonds par formule restent conditionnels à une décision commerciale.
2. La validation manuelle de l'isolation multi-entreprise est confirmée en phase 1 ; maintenir les tests de non-régression sur chaque nouvel endpoint métier.
3. Maintenir les sauvegardes quotidiennes OneDrive et mettre en place la surveillance d'erreurs en production.
4. Préparer les documents légaux et la procédure de gestion des données personnelles avant une mise en service réelle.
5. Faire évoluer l'interface et le référencement public selon les retours d'usage.

- [2026-10-01] · Module Entretiens ajouté : modèle et API sécurisés par entreprise avec filtres statut/type, formulaire global, changement de statut et carnet de santé par véhicule dans le dashboard. Build frontend validé ; les tests backend nécessitent l'accès réseau MongoDB Atlas, bloqué par la sandbox.
- [2026-10-02] · Module Coûts ajouté : dépenses et pleins par véhicule, filtres période/véhicule/catégorie, KPI TCO, coût/km, comparaison mensuelle, répartition et évolution mensuelle, historique et export CSV. Tests RBAC ciblés (18) et build frontend validés.
- [2026-10-02] · Suivi carburant ajouté sous Coûts : pleins enrichis (station, type de carburant), consommation L/100 km, coût/km, moyennes par véhicule, alerte au-delà de 12 L/100 km, modification et suppression. Tests RBAC ciblés (18) et build frontend validés.
- [2026-10-02] · Module Documents & contrats ajouté : dépôt local de fichiers contrôlés (10 Mo), consultation authentifiée, téléchargement, archivage, suppression, association véhicule, filtres et statuts d’échéance avec alertes à 30 jours. `multer` est utilisé pour le multipart ; le stockage local est réservé au développement et devra être remplacé par un stockage persistant avant la production.
- [2026-10-02] · Page Rapports ajoutée : sélecteur de période et véhicule, rapports activité/coûts/carburant/entretiens/alertes/affectations, tableau de résultat, export CSV et génération PDF via impression navigateur, sans nouvelle dépendance.
- [2026-10-02] · Alertes enrichies : priorités information/faible/moyen/élevé/critique, statuts affichés active/traitée/ignorée, filtres véhicule/priorité/statut, compteur dans la navigation et actions de traitement/ignorance. Synchronisation automatique persistée pour les entretiens à venir/en retard, documents arrivant à échéance/expirés et consommations supérieures à 12 L/100 km.
- [2026-10-02] · Fiche véhicule enrichie : informations générales, photo HTTPS facultative, mise en circulation, affectations, entretiens, prochain entretien, alertes, documents/contrats, dépenses, consommation moyenne, TCO, coût/km et actions rapides vers les formulaires existants. La photo reste une URL contrôlée, sans stockage de fichier supplémentaire.
- [2026-10-02] · Vue d’ensemble enrichie : actions rapides, KPI véhicules/alertes/entretiens/coûts, cartes cliquables avec filtres associés, éléments récents, échéances proches, répartitions flotte/dépenses et boutons « Voir tout ».
- [2026-10-02] · Barre supérieure enrichie : logo retour dashboard, bascule clair/sombre conservée, cloche ouvrant les alertes avec compteur actif, menu profil avec identité/rôle et déconnexion directe ou depuis le menu. Build frontend et diagnostics validés.
- [2026-10-02] · Menu profil complété avec les liens profil, paramètres entreprise, documents & contrats, préférences de notification, centre d’aide et trois pages légales. Les préférences persistantes et les pages dédiées profil/entreprise restent hors périmètre actuel ; les entrées affichent un message explicite.
- [2026-10-02] · Page « Mon profil » ajoutée : avatar initiales, informations personnelles, téléphone facultatif, email modifiable, rôle/fonction en lecture seule et changement sécurisé du mot de passe avec confirmation et affichage/masquage. Nouvelle route authentifiée `PATCH /api/auth/me`, sans suppression de compte ni historique de connexions pour le moment. Tests d’authentification (6) et build frontend validés.
- [2026-10-02] · Page « Paramètres de l’entreprise » ajoutée pour les administrateurs : identité, logo HTTPS facultatif, adresse, contacts, SIRET fictif en lecture seule, secteur, taille de flotte, devise, fuseau horaire, format de date, unités distance/carburant et seuils d’alertes. Nouvelle route sécurisée `PATCH /api/auth/entreprise` avec whitelist et filtrage par entreprise JWT. Build frontend, syntaxe backend et tests d’authentification (6) validés.
- [2026-10-02] · État de chargement initial du frontend rendu explicite et visible (« Chargement de votre session... ») afin d’éviter un écran vide pendant la vérification du JWT au démarrage local.
- [2026-10-02] · Correction du mode local : Vite utilise automatiquement `http://localhost:5000/api` en développement au lieu de l’URL Render définie dans `.env`. L’URL Render reste utilisée pour les builds de production.
- [2026-10-03] · Correction du bundle Vercel : la sélection d’URL API est désormais explicite (`localhost:5000` uniquement en développement, Render en production), évitant qu’un smartphone tente d’appeler son propre localhost. Un redéploiement Vercel est nécessaire.
- [2026-10-02] · Correction écran noir Vite : les imports du contexte d’authentification sont désormais uniformisés avec l’extension `.jsx`, évitant deux instances de `AuthContext` pendant le hot reload (`useAuth` hors `AuthProvider`).
- [2026-10-02] · Ajout d’un Error Boundary frontend : une exception React affiche désormais un message visible et un bouton de rechargement au lieu de laisser un écran noir silencieux.
- [2026-10-02] · L’onglet visible « Paramètres entreprise » a été retiré de la navigation principale à la demande de Julie ; la page reste accessible uniquement depuis le menu Profil.
- [2026-10-03] · Préférences de notification ajoutées au menu Profil : notifications dans l’application, e-mails, rappels d’entretiens, alertes documents/contrats, consommation inhabituelle et résumés périodiques. Les choix sont persistés par utilisateur via `PATCH /api/auth/me`, avec validation et whitelist serveur ; les e-mails et résumés sont désactivés par défaut.
- [2026-10-03] · Phase 1 des états dashboard ajoutée : état d’action partagé avec message accessible et désactivation des contrôles pendant les envois, confirmations d’archivage des documents et états de focus/disabled harmonisés.
- [2026-10-03] · Phase 2A des états dashboard ajoutée : recherche, filtres conservés, tri explicite et pagination accessible sur les listes véhicules et entretiens. Les listes alertes, affectations, utilisateurs, documents et coûts restent à harmoniser séparément en raison de leurs rendus et actions différents.
- [2026-10-03] · Phase 3A des états dashboard ajoutée : recherche, tri et pagination locale sur les alertes et affectations, avec conservation des actions de traitement, d’ignorance, de modification et de clôture. Les listes utilisateurs, documents et coûts restent à traiter dans la prochaine tranche.
- [2026-10-03] · Phase 4 des états dashboard ajoutée : recherche, tri et pagination locale sur les utilisateurs, documents et historique des dépenses, avec conservation des actions d’administration, consultation, téléchargement, archivage, suppression et export.
- [2026-10-03] · Finitions de navigation ajoutées : page 404 personnalisée pour les ancres inconnues, page « Accès refusé » pour les routes protégées ou rôles non autorisés, et toasts de succès/erreur après les actions du dashboard. Build Vite relancé mais bloqué localement par `Access is denied` lors de la suppression d’un fichier temporaire esbuild.
- [2026-10-04] · Phase 1 mobile initialisée dans `mobile/` avec Expo SDK 57, TypeScript, Expo Router, écran « Mobile est prêt », configuration CarLog Pro, palette mobile, variables publiques `.env.example` et environnement Android local via `10.0.2.2`. Projet lancé dans l’émulateur Android ; TypeScript, ESLint et bundle Metro validés.
- [2026-10-04] · Phase 2 mobile ajoutée : design system centralisé clair/sombre, hook `useAppTheme`, composants `Screen`, `AppButton`, `AppCard` et `StatusBadge`, puis écran de prévisualisation CarLog Pro Mobile. TypeScript, ESLint et Expo Doctor validés ; l’export Android reste bloqué par une permission Windows sur le fichier temporaire Hermes.
- [2026-10-04] · Phase 3 mobile ajoutée : navigation Expo Router avec authentification de démonstration, cinq onglets (accueil, véhicules, actions, alertes, profil), fiches véhicule/alerte et formulaires terrain pour plein/anomalie. TypeScript, ESLint et Expo Doctor validés.
- [2026-10-04] · Correction navigation mobile : après connexion, Expo Router cible désormais le groupe `/(tabs)` plutôt que `/(tabs)/index`, ce qui supprime l’erreur « Unmatched Route ». Metro a été relancé avec le cache vidé.
- [2026-10-07] · Phase 4 mobile ajoutée : session de démonstration persistée dans `expo-secure-store`, restauration au démarrage, déconnexion avec effacement sécurisé, validation du formulaire de connexion, affichage/masquage du mot de passe, erreurs et bouton désactivé pendant l’envoi. L’API réelle et le JWT restent prévus pour l’étape suivante.

---

*Adapté du starter CLAUDE.md générique pour coller au projet réel CarLog Pro (Express/MongoDB/React, SaaS B2B de gestion de flotte).*