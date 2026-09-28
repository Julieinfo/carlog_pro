# CarLog Pro — validation et prochaines étapes

État observé le 28 septembre 2026. Cette checklist distingue les vérifications automatisées déjà observées des parcours manuels encore à valider. Une case non cochée signifie « preuve de validation non trouvée », pas nécessairement « fonctionnalité absente ».

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
| 7 — Production | Protections HTTP, JWT, limitation auth, validation, transactions et isolation présentes. | À compléter : sauvegarde/restauration, CI et vérifications de production. Aucun Dockerfile ni workflow GitHub Actions n'a été trouvé. |
| 8 — Livraison | La suite Jest complète et le build frontend ont réussi lors des dernières vérifications. | Pas prêt à publier : E2E, vérifications manuelles, accessibilité/mobile, guide de déploiement et acceptation explicite restent à faire. |

## Preuves automatisées déjà observées

- [x] Suite backend complète : `npm test` — 84 tests, 17 suites réussis lors de l'exécution du 28 septembre 2026.
- [x] Build frontend : `npm run build` réussi lors de la dernière vérification.
- [x] Tests couvrant auth/JWT, autorisations, isolation de certains contrôleurs, affectations concurrentes, PTAC et règles Phase 4.
- [x] `MONGO_URI_TEST` est configurée séparément de `MONGO_URI` dans l'environnement local vérifié ; ne jamais imprimer leurs valeurs.
- [ ] Tests automatisés frontend ou E2E : aucune stack frontend/E2E présente actuellement.

## Checklist manuelle, dans l'ordre des dépendances

### Phase 0 — Environnement de travail

- [ ] Démarrer backend et frontend avec les commandes du README ; vérifier les ports et `GET /api/health`.
- [ ] Ouvrir la Preview/Replit et confirmer qu'elle atteint l'API via `/api` ou `VITE_API_URL`.
- [ ] Vérifier les erreurs de démarrage sans afficher les secrets.
- [ ] Choisir et valider une direction de design : `CLAUDE.md` décrit un thème clair tandis que le CSS courant est sombre.

### Phase 1 — API et sécurité

- [ ] Tester inscription, connexion, `/api/auth/me`, JWT invalide/expiré et absence du mot de passe dans les réponses.
- [ ] Vérifier compte utilisateur désactivé et entreprise inactive.
- [x] Vérifier les règles d'accès des abonnements `trial`, `active`, `past_due`, `canceled` ; Julie a confirmé que tous les scénarios de la politique d'abonnement ont été vérifiés.
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
- [x] Vérifier les états de chargement, de liste vide et d'API indisponible (confirmation de Julie).
- [ ] Vérifier séparément l'état d'erreur du dashboard.

### Phase 7 — Préparation production

- [ ] Vérifier séparément configurations dev/test/prod et l'absence de secrets dans Git, logs et bundle frontend.
- [ ] Retirer `MONGO_URI` et `JWT_SECRET` de `frontend/.env` s'ils y sont encore ; conserver ces secrets dans l'environnement backend.
- [ ] Vérifier rate limiting, CORS, taille JSON, erreurs génériques, démarrage et arrêt backend.
- [ ] Définir la destination protégée, la fréquence et la rétention des sauvegardes durables ; les sauvegardes Cloud Atlas natives ne sont pas disponibles sur le cluster Free/M0 courant.
- [x] Restaurer un dump de la base dédiée `carlog_pro_test` dans `carlog_pro_restore_check_20260928` ; les 5 collections ont le même nombre de documents après restauration. La copie de vérification est isolée de la source.
- [ ] Ajouter/valider une CI qui lance tests backend et build frontend avant livraison.
- [ ] Préparer le déploiement Render/Vercel ou Replit, puis vérifier HTTPS et variables sans afficher leurs valeurs.

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
6. **Préparer la phase 7** : secrets/environnements, sauvegarde-restauration, CI et hébergement.
7. **Exécuter la phase 8** : E2E, accessibilité, responsive, documentation, tests/build propres et feu vert de publication.

Stripe, paiements, emails, PWA, application mobile native, géolocalisation active, exports comptables avancés et maintenance prédictive restent hors de cet ordre MVP, sauf décision produit explicite.
