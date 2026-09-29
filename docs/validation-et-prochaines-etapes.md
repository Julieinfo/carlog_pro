# CarLog Pro — validation et prochaines étapes

État observé le 27 septembre 2026, phase 7 mise à jour le 29 septembre 2026. Cette checklist distingue les vérifications automatisées déjà observées des parcours manuels encore à valider. Une case non cochée signifie « preuve de validation non trouvée », pas nécessairement « fonctionnalité absente ».

## État synthétique

| Phase | État du code | Acceptation de phase |
|---|---|---|
| 0 — Socle | Largement prêt ; architecture, `.replit`, variables et commandes documentés. `README.md` actualisé. URI de test distincte de l'URI principale. | À compléter : vérifier Preview et démarrage réel ; la cohérence du design system reste à trancher. |
| 1 — Backend/sécurité | Largement implémenté ; tests backend passent. | À compléter : validation manuelle multi-entreprises et confirmation explicite. |
| 2 — Auth frontend | Inscription, connexion, session persistée et expiration gérées dans le code. | À compléter : tests avec vrais comptes dans Preview, notamment compte inactif et serveur indisponible. |
| 3 — Véhicules | CRUD, archivage, filtres, permissions et validation PTAC présents. | À compléter : vérification manuelle après actualisation ; détails de maintenance absents de la fiche véhicule. |
| 4 — Alertes/affectations | Fonctions principales présentes ; cohérence des statuts et alertes conducteur renforcées ; scénarios unitaires ajoutés. | À compléter : parcours complet réel, tous les rôles et acceptation de phase. Le filtre d'alertes par véhicule n'est pas disponible dans l'écran actuel. |
| 5 — Utilisateurs | L'admin peut consulter, créer et désactiver des comptes. | Partiel : modification utilisateur absente ; rôles encore affichés comme codes techniques. |
| 6 — Dashboard | KPI et répartition de flotte calculés depuis l'API avec contrôle de rôle. | À compléter : rapprochement des chiffres avec les listes et plusieurs entreprises. |
| 7 — Production | Protections HTTP, JWT, limitation auth, validation, transactions et isolation présentes et vérifiées en mode production (29/09). Erreurs 4xx/404 API rendues génériques et en JSON ; `npm start` sans nodemon ; `.env.example`, `check:env`, `render.yaml`, `vercel.json`, workflows CI et sauvegarde ajoutés ; CI verte au premier run (PR #12). | À compléter : choix de la destination de sauvegarde et première sauvegarde, déploiement puis vérification HTTPS, démarrage/arrêt réels avec MongoDB. Détails : `docs/deploiement.md`, `docs/sauvegarde.md`. |
| 8 — Livraison | La suite Jest complète et le build frontend ont réussi lors des dernières vérifications. | Pas prêt à publier : E2E, vérifications manuelles, accessibilité/mobile, guide de déploiement et acceptation explicite restent à faire. |

## Preuves automatisées déjà observées

- [x] Suite backend complète : `npm test` — 59 tests, 11 suites réussis lors de la dernière exécution avec base de test (27/09).
- [x] Suites unitaires (sans MongoDB) : 15 suites, 81 tests réussis le 29/09 dans l'environnement de préparation, dont la nouvelle suite `erreursProduction.unit.test.js` (8 tests). Les 2 suites d'intégration (`auth.test.js`, `affectationConcurrency.test.js`, 8 tests) n'ont pas pu s'exécuter localement (aucun MongoDB accessible) mais ont réussi dans la CI GitHub du 29/09 (run `36562206517`, étape `Run tests` verte). Total actuel : 17 suites, 89 tests.
- [x] Build frontend : `npm run build` réussi le 29/09 ; bundle `dist/` analysé : aucune occurrence de `mongodb`, `MONGO_URI`, `JWT_SECRET`, d'URI Atlas ni de JWT.
- [x] Tests couvrant auth/JWT, autorisations, isolation de certains contrôleurs, affectations concurrentes, PTAC, règles Phase 4, arrêt propre, limiteurs, erreurs de production et CORS.
- [x] `MONGO_URI_TEST` est configurée séparément de `MONGO_URI` dans l'environnement local vérifié ; ne jamais imprimer leurs valeurs. `npm run check:env` refuse désormais une `MONGO_URI_TEST` identique à `MONGO_URI`.
- [ ] Tests automatisés frontend ou E2E : aucune stack frontend/E2E présente actuellement.

## Checklist manuelle, dans l'ordre des dépendances

### Phase 0 — Environnement de travail

- [ ] Démarrer backend et frontend avec les commandes du README ; vérifier les ports et `GET /api/health`.
- [ ] Ouvrir la Preview/Replit et confirmer qu'elle atteint l'API via `/api` ou `VITE_API_URL`.
- [ ] Vérifier les erreurs de démarrage sans afficher les secrets.
- [ ] Choisir et valider une direction de design : `CLAUDE.md` décrit un thème clair tandis que le CSS courant est sombre.

### Phase 1 — API et sécurité

- [ ] Tester inscription, connexion, `/api/auth/me`, JWT invalide/expiré et absence du mot de passe dans les réponses.
- [ ] Vérifier compte utilisateur désactivé, entreprise inactive et abonnements `trial`, `active`, `past_due`, `canceled`.
- [ ] Utiliser deux entreprises et vérifier véhicules, alertes, affectations, statistiques et utilisateurs : aucune lecture ou référence croisée ne doit passer.
- [ ] Tester les permissions des cinq rôles sur les opérations sensibles et vérifier les codes 400/401/403/404 attendus.
- [ ] Confirmer qu'un `entreprise` fourni par le client ne remplace jamais celle du JWT.

### Phase 2 — Authentification frontend

- [ ] Créer un compte de test avec des informations entreprise réelles et valides ; vérifier les données persistées.
- [ ] Tester mauvais email, mauvais mot de passe, compte désactivé et API indisponible ; contrôler les messages affichés.
- [ ] Actualiser une session valide, puis tester un token expiré/refusé et vérifier la déconnexion propre.
- [ ] Vérifier la déconnexion volontaire et le refus d'accès au dashboard sans session.
- [ ] Rejouer le parcours dans Preview, pas seulement sur `localhost`.

### Phase 3 — Véhicules

- [ ] Créer, modifier, rechercher, filtrer et archiver un véhicule ; actualiser la page et contrôler la persistance.
- [ ] Vérifier champs requis, PTAC vide/0/négatif, formats invalides et messages visibles.
- [ ] Vérifier états disponible/en course/maintenance/en panne, pagination et exclusion des véhicules archivés.
- [ ] Confirmer que conducteur et autres rôles ne peuvent pas effectuer d'action interdite, même en appelant l'API directement.
- [ ] Décider si les prochaines échéances/alertes de maintenance doivent être visibles dans la fiche véhicule pour satisfaire le dossier.

### Phase 4 — Alertes et affectations

- [ ] Créer une alerte liée à un véhicule autorisé, la résoudre et tester les filtres statut/urgence.
- [ ] Créer puis clôturer une affectation avec kilométrages ; vérifier le statut et le kilométrage du véhicule.
- [ ] Rejouer les conflits : véhicule déjà affecté, conducteur déjà affecté, déplacement vers un véhicule occupé, conducteur occupé.
- [ ] Changer le véhicule d'une affectation en cours ; vérifier ancien véhicule disponible et nouveau véhicule en course.
- [ ] Supprimer une affectation en cours puis une terminée ; vérifier que seule la première libère le véhicule.
- [ ] Vérifier qu'un conducteur ne voit que ses affectations, les alertes de ses véhicules affectés, et aucun historique d'un autre véhicule.
- [ ] Tester le mécanicien, le comptable, le fleet manager et l'admin ; contrôler les refus côté API.
- [ ] Décider si l'interface doit ajouter un filtre d'alertes par véhicule.

### Phase 5 — Utilisateurs

- [ ] En tant qu'admin, créer un utilisateur, vérifier entreprise/rôle et désactiver le compte ; tenter ensuite sa connexion.
- [ ] Confirmer la politique pour modifier un utilisateur et réactiver un compte ; ces fonctions ne sont pas disponibles actuellement.
- [ ] Remplacer/valider les libellés lisibles des rôles dans l'écran et tester les actions interdites via API.

### Phase 6 — Dashboard

- [ ] Relever les comptes avant/après création et archivage véhicule, alerte et affectation ; comparer les KPI aux listes.
- [ ] Comparer les chiffres de deux entreprises et tester les vues admin, manager et comptable.
- [ ] Tester les états chargement, vide, erreur et API indisponible.

### Phase 7 — Préparation production

Vérifications du 29 septembre 2026, réalisées dans un environnement sans MongoDB ni accès aux dashboards Render/Vercel/Atlas. Les valeurs de secrets n'ont été ni lues ni affichées.

- [x] **Configurations dev/test/prod séparées.** `db.js` choisit `MONGO_URI_TEST` quand `NODE_ENV=test`, `MONGO_URI` sinon ; `server.js` exige `MONGO_URI` et `JWT_SECRET`, plus `FRONTEND_URL` en production, et s'arrête (code 1) en listant uniquement les noms manquants — vérifié en lançant le serveur sans variables, sans `FRONTEND_URL`, puis avec un Mongo injoignable (le journal ne contient que `Erreur MongoDB : MongooseServerSelectionError`, jamais l'URI). Modèles `backend/.env.example` et `frontend/.env.example` ajoutés ; `.gitignore` racine étendu à `.env.*` (`.env.local`, `.env.production`… n'étaient pas ignorés) en conservant `.env.example`.
- [x] **Aucun secret dans Git.** Historique complet récupéré (87 commits, 12 branches distantes) : aucun fichier `.env*` n'a jamais été commité ; le scan de tous les blobs (URI Mongo avec identifiants, `JWT_SECRET=`, clés privées, jetons) ne remonte que trois fixtures de tests unitaires à hôtes factices. Le job `hygiene` de la CI refuse désormais tout `.env` suivi.
- [x] **Aucun secret dans le bundle frontend.** `npm run build` puis analyse de `dist/` : zéro occurrence. Contre-épreuve : un `frontend/.env` temporaire contenant `MONGO_URI`/`JWT_SECRET` factices n'a rien injecté dans le bundle (Vite n'expose que `VITE_*`) ; fichier supprimé ensuite. La CI rejoue ce contrôle à chaque build.
- [x] **Secrets réservés au backend dans le dépôt.** Le code frontend ne lit que `import.meta.env.VITE_API_URL` ; `frontend/.env` n'est ni présent dans ce checkout, ni suivi, ni dans l'historique.
- [ ] **Poste local de Julie :** ouvrir `frontend/.env` s'il existe et supprimer toute ligne `MONGO_URI` ou `JWT_SECRET` — non vérifiable depuis le dépôt. Prendre `frontend/.env.example` comme référence.
- [x] **Rate limiting.** Vérifié en mode production : 11ᵉ tentative de connexion ou d'inscription depuis la même IP → 429 `Trop de tentatives. Réessayez plus tard.` (aucun seuil chiffré), en-têtes `RateLimit-*` standard, anciens `X-RateLimit-*` absents ; `trust proxy` à 1 en production. Verrouillage par email après 5 échecs couvert par tests unitaires.
- [x] **CORS.** En production, seule `FRONTEND_URL` est acceptée (préflight OK) ; `localhost:5173` et une origine inconnue ne reçoivent aucun en-tête CORS. Correctif : barre oblique finale de `FRONTEND_URL` tolérée (test ajouté).
- [x] **Taille JSON.** Corps de 101 kb → 413 ; 90 kb accepté.
- [x] **Erreurs génériques en production.** Écarts corrigés dans `app.js` : les erreurs du parseur renvoyaient `Une erreur interne est survenue.` sur des 4xx → désormais `Corps de requête trop volumineux.` (413) et `Corps de requête JSON invalide.` (400), sans détail interne ; route `/api/*` inconnue → 404 JSON `Ressource introuvable.` au lieu de la page HTML Express ; 5xx toujours générique ; `/api-docs` non affecté. Hors production, `error.message` est conservé. 8 tests ajoutés (`erreursProduction.unit.test.js`).
- [x] **En-têtes Helmet en production** : HSTS (`max-age=31536000; includeSubDomains`), `nosniff`, `X-Frame-Options`, CSP, Referrer-Policy, CORP présents ; `X-Powered-By` absent.
- [x] **Démarrage en production.** Écart corrigé : `npm start` lançait `nodemon` (devDependency) ; simulation d'une installation Render (`NODE_ENV=production npm ci`) confirmée sans nodemon ni jest → le nouveau `start` (`node src/server.js`) charge l'application et n'échoue que sur la connexion Mongo factice. `npm run dev` conserve nodemon ; `.replit`, README et replit.md mis à jour.
- [x] **Arrêt propre** : 4 tests unitaires `arretPropre.unit.test.js` passent (SIGTERM/SIGINT, ordre HTTP puis Mongo, double signal, délai 10 s).
- [ ] **Démarrage et arrêt réels avec MongoDB** (serveur connecté, `SIGTERM` envoyé, fermeture observée dans les journaux) : non exécutables ici, à rejouer en local avec `backend/.env`.
- [x] **Politique de sauvegarde définie** : `docs/sauvegarde.md` (mongodump quotidien chiffré AES-256, 30 quotidiennes + 12 mensuelles, utilisateur Atlas dédié en lecture seule, exercice de restauration trimestriel). Workflow `.github/workflows/sauvegarde.yml` préparé et **inerte** tant que les secrets n'existent pas ; aucun export n'a été effectué.
- [ ] **Décision de destination** (option A bucket privé R2/B2 recommandée, B Render Cron, C manuel, D Atlas Flex) puis première sauvegarde manuelle et contrôle dans le bucket.
- [ ] **Trace de la restauration en base isolée** : indiquée comme réussie par Julie mais absente du dépôt ; reporter date, base cible et résultat dans `docs/sauvegarde.md` §6. Non rejouée (consigne).
- [x] **CI ajoutée** : `.github/workflows/ci.yml` — tests backend avec MongoDB 8 éphémère en replica set (Docker, aucun secret de dépôt, `JWT_SECRET` généré et masqué), `check:env`, build frontend + scan du bundle, job `hygiene`. Syntaxe YAML et scripts shell validés ; étapes hors Docker rejouées localement. Reprend le `ci.yml` de la PR #11 (fusion du 29/09 dont le job backend avait échoué, faute de base de test, avant remise de `main` à `7a015c8`).
- [x] **Première exécution verte de la CI sur GitHub** : run `36562206517` du 29/09 (push de `arena/01a0ecd2-carlog-pro`, PR #12) — les trois jobs `Backend tests` (MongoDB éphémère démarré, `check:env`, `npm test` réussi, donc suites d'intégration incluses), `Frontend build` (bundle sans motif de secret) et `hygiene` sont verts. Le détail du journal n'a pas pu être téléchargé depuis l'environnement de préparation ; seules les conclusions des étapes ont été lues.
- [x] **Déploiement préparé** pour Render + Vercel (fournisseurs de `CLAUDE.md`) : `render.yaml` (Blueprint, secrets hors fichier, health check, déploiement conditionné aux checks), `frontend/vercel.json` (Vite + en-têtes de sécurité), `docs/deploiement.md` (variables par service, ordre de mise en service, commandes de vérification), `npm run check:env`.
- [ ] **HTTPS et variables en production** : vérifiables seulement après le premier déploiement (commandes prêtes dans `docs/deploiement.md` §4). Aucun déploiement ni modification de service externe n'a été réalisé.
- [ ] **Décisions en attente** (détail `docs/deploiement.md` §6) : exposition publique de `/api-docs` en production, plan Render gratuit (mise en veille), prévisualisations Vercel bloquées par CORS, GitHub Pages actif sur `main`.

### Phase 8 — Qualité et livraison

- [ ] Exécuter `npm test` et `npm run build` depuis un checkout propre.
- [ ] Rejouer les parcours complets inscription → connexion → véhicule → alerte → affectation → clôture → statistiques → utilisateur.
- [ ] Tester deux entreprises, les cinq rôles, erreurs réseau/API et les vues desktop/tablette/mobile.
- [ ] Contrôler labels, navigation clavier, erreurs lisibles et contrastes ; résoudre l'incohérence de thème validée en Phase 0.
- [ ] Mettre à jour les consignes de lancement/déploiement, revoir les dépendances/secrets et obtenir une validation explicite avant publication.

## Ordre de travail recommandé

1. **Terminer et accepter les phases 0–1** : confirmer Preview/environnement, résoudre le point de design, puis valider la sécurité avec deux entreprises et les cinq rôles.
2. **Accepter les phases 2–3** : essais réels de session dans Preview et parcours véhicule complet ; décider du niveau d'information de maintenance.
3. **Clore la phase 4** : parcours alertes/affectations réel pour tous les profils concernés ; traiter le filtre véhicule si retenu ; confirmer les statuts et conflits en base.
4. **Compléter la phase 5** : décider si l'édition/réactivation de comptes entre dans le MVP, améliorer les libellés de rôle et couvrir les parcours utilisateur.
5. **Valider la phase 6** : comparer les KPI réels à la base et aux listes pour plusieurs entreprises/rôles.
6. **Terminer la phase 7** : relire et fusionner la PR #12, choisir la destination de sauvegarde et lancer la première sauvegarde, déployer Render/Vercel puis exécuter les vérifications HTTPS/variables ; trancher les décisions listées dans `docs/deploiement.md` §6.
7. **Exécuter la phase 8** : E2E, accessibilité, responsive, documentation, tests/build propres et feu vert de publication.

Stripe, paiements, emails, PWA, application mobile native, géolocalisation active, exports comptables avancés et maintenance prédictive restent hors de cet ordre MVP, sauf décision produit explicite.
