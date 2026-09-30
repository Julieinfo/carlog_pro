# CarLog Pro — validation et prochaines étapes

État observé le 29 septembre 2026. Cette checklist distingue les vérifications automatisées déjà observées des parcours manuels encore à valider. Une case non cochée signifie « preuve de validation non trouvée », pas nécessairement « fonctionnalité absente ».

## État synthétique

| Phase | État du code | Acceptation de phase |
|---|---|---|
| 0 — Socle | Architecture, `.replit`, variables et commandes documentés. Backend/frontend, API de santé et Preview validés selon Julie. URI de test distincte de l'URI principale. Thèmes clair et sombre disponibles. | **Terminée et officiellement validée par Julie le 28 septembre 2026.** |
| 1 — Backend/sécurité | Largement implémenté ; tests backend passent. | Validée : Julie confirme que tous les parcours de sécurité et d'isolation ont été réalisés. |
| 2 — Auth frontend | Inscription, connexion, session persistée et expiration gérées dans le code. | **Validée : Julie confirme que tous les parcours de la phase 2 ont été réalisés.** |
| 3 — Véhicules | CRUD, archivage, filtres, permissions et validation PTAC présents. | **Validée : Julie confirme que tous les parcours et vérifications de la phase 3 ont été réalisés.** |
| 4 — Alertes/affectations | Fonctions principales présentes ; cohérence des statuts et alertes conducteur renforcées ; scénarios unitaires ajoutés. | **Validée : Julie confirme que tous les parcours et vérifications de la phase 4 ont été réalisés.** |
| 5 — Utilisateurs | Consultation, création, modification, désactivation et réactivation sont implémentées ; les rôles sont libellés en français. | **Validée : Julie confirme que tous les parcours et vérifications de la phase 5 ont été réalisés.** |
| 6 — Dashboard | KPI et répartition de flotte calculés depuis l'API avec contrôle de rôle. | **Validée : Julie confirme que tous les contrôles de la phase 6 ont été réalisés.** |
| 7 — Production | Protections HTTP, JWT, limitation auth, validation, transactions et isolation présentes. API Render et frontend Vercel déployés ; CI et sauvegardes M0 vers OneDrive configurées. | **Terminée selon la confirmation de Julie : sauvegardes et restauration, CI, configuration de production et parcours frontend → API vérifiés.** |
| 8 — Livraison | Tests/build, parcours E2E, contrôles d'accessibilité et responsive, documentation et préparation de publication réalisés selon Julie. | **Terminée et acceptée par Julie le 29 septembre 2026.** |

## Preuves automatisées déjà observées

- [x] Suite backend complète : `npm test` — 84 tests, 17 suites réussis lors de l'exécution du 28 septembre 2026.
- [x] Suite backend rejouée le 30 septembre 2026 après réparation du dépôt : 80 tests, 16 suites réussis sur la base dédiée. Les 19 fichiers suivis absents du disque ont été restaurés depuis Git, la ligne dupliquée de `arretPropre.js` supprimée et `middlewares/rateLimiters.js` (perdu lors du merge `2b9225b`) restauré depuis `607e131`. Le total de 17 suites correspond à une exécution antérieure : la branche courante contient 16 fichiers de test.
- [x] Build frontend : `npm run build` réussi lors de la dernière vérification.
- [x] Tests couvrant auth/JWT, autorisations, isolation de certains contrôleurs, affectations concurrentes, PTAC et règles Phase 4.
- [x] `MONGO_URI_TEST` est configurée séparément de `MONGO_URI` dans l'environnement local vérifié ; ne jamais imprimer leurs valeurs.
- [x] Contrôles frontend/E2E de la phase 8 réalisés et validés par Julie.

## Checklist manuelle, dans l'ordre des dépendances

### Phase 0 — Environnement de travail

- [x] Démarrer backend et frontend avec les commandes du README ; vérifier les ports et `GET /api/health` (réalisé, confirmation de Julie).
- [x] Ouvrir la Preview/Replit et confirmer qu'elle atteint l'API via `/api` ou `VITE_API_URL` (réalisé, confirmation de Julie).
- [x] Vérifier les erreurs de démarrage sans afficher les secrets (réalisé, confirmation de Julie).
- [x] Choisir la direction de design : thème clair initial conforme à `CLAUDE.md`, avec option sombre via le bouton de bascule.
- [x] Vérifier visuellement les deux thèmes sur connexion, inscription et dashboard (fonctionnement confirmé par Julie).

### Phase 1 — API et sécurité

- [x] Tester inscription, connexion, `/api/auth/me`, JWT invalide/expiré et absence du mot de passe dans les réponses (réalisé, confirmation de Julie).
- [x] Vérifier compte utilisateur désactivé et entreprise inactive (réalisé, confirmation de Julie).
- [x] Vérifier les règles d'accès des abonnements `trial`, `active`, `past_due`, `canceled` ; Julie a confirmé que tous les scénarios de la politique d'abonnement ont été vérifiés.
- [x] Utiliser deux entreprises et vérifier véhicules, alertes, affectations, statistiques et utilisateurs : aucune lecture ou référence croisée ne doit passer (réalisé, confirmation de Julie).
- [x] Tester les permissions des cinq rôles sur les opérations sensibles et vérifier les codes 400/401/403/404 attendus (réalisé, confirmation de Julie).
- [x] Confirmer qu'un `entreprise` fourni par le client ne remplace jamais celle du JWT (réalisé, confirmation de Julie).

### Phase 2 — Authentification frontend

- [x] Créer un compte de test avec des informations entreprise réelles et valides ; vérifier les données persistées (réalisé, confirmation de Julie).
- [x] Tester mauvais email, mauvais mot de passe, compte désactivé et API indisponible ; contrôler les messages affichés (réalisé, confirmation de Julie).
- [x] Actualiser une session valide, puis tester un token expiré/refusé et vérifier la déconnexion propre (réalisé, confirmation de Julie).
- [x] Vérifier la déconnexion volontaire et le refus d'accès au dashboard sans session (réalisé, confirmation de Julie).
- [x] Rejouer le parcours dans Preview, pas seulement sur `localhost` (réalisé, confirmation de Julie).

### Phase 3 — Véhicules

- [x] Créer, modifier, rechercher, filtrer et archiver un véhicule ; actualiser la page et contrôler la persistance (réalisé, confirmation de Julie).
- [x] Vérifier champs requis, PTAC vide/0/négatif, formats invalides et messages visibles (réalisé, confirmation de Julie).
- [x] Vérifier états disponible/en course/maintenance/en panne, pagination et exclusion des véhicules archivés (réalisé, confirmation de Julie).
- [x] Confirmer que conducteur et autres rôles ne peuvent pas effectuer d'action interdite, même en appelant l'API directement (réalisé, confirmation de Julie).
- [x] Confirmer le traitement des prochaines échéances/alertes de maintenance dans la fiche véhicule pour le périmètre du dossier (réalisé, confirmation de Julie).

### Phase 4 — Alertes et affectations

- [x] Créer une alerte liée à un véhicule autorisé, la résoudre et tester les filtres statut/urgence (réalisé, confirmation de Julie).
- [x] Créer puis clôturer une affectation avec kilométrages ; vérifier le statut et le kilométrage du véhicule (réalisé, confirmation de Julie).
- [x] Rejouer les conflits : véhicule déjà affecté, conducteur déjà affecté, déplacement vers un véhicule occupé, conducteur occupé (réalisé, confirmation de Julie).
- [x] Changer le véhicule d'une affectation en cours ; vérifier ancien véhicule disponible et nouveau véhicule en course (réalisé, confirmation de Julie).
- [x] Supprimer une affectation en cours puis une terminée ; vérifier que seule la première libère le véhicule (réalisé, confirmation de Julie).
- [x] Vérifier qu'un conducteur ne voit que ses affectations, les alertes de ses véhicules affectés, et aucun historique d'un autre véhicule (réalisé, confirmation de Julie).
- [x] Tester le mécanicien, le comptable, le fleet manager et l'admin ; contrôler les refus côté API (réalisé, confirmation de Julie).
- [x] Valider le périmètre du filtre d'alertes par véhicule pour l'interface (réalisé, confirmation de Julie).

### Phase 5 — Utilisateurs

- [x] Parcours manuel admin : créer un utilisateur, vérifier son entreprise et son rôle, puis le désactiver et tenter sa connexion (réalisé, confirmation de Julie).
- [x] Parcours manuel admin : consulter la liste et la fiche/ligne utilisateur (réalisé, confirmation de Julie).
- [x] Parcours manuel admin : modifier les coordonnées et le rôle d'un autre utilisateur, puis vérifier la persistance (réalisé, confirmation de Julie).
- [x] Parcours manuel admin : réactiver un utilisateur désactivé et vérifier qu'il peut se reconnecter (réalisé, confirmation de Julie).
- [x] Périmètre acté : l'édition et la réactivation font partie de la phase 5 et sont livrées ; ne pas les considérer comme des fonctions reportées.
- [x] Libellés français des cinq rôles présents dans l'interface : Administrateur, Gestionnaire de flotte, Conducteur, Mécanicien, Comptable.
- [x] Couverture automatisée backend édition/réactivation : liste blanche des champs, unicité email, isolement entreprise, exclusion du mot de passe et interdiction de modifier le rôle/statut de son propre compte ; 7 tests ciblés réussis le 28 septembre 2026.
- [x] Build frontend réussi le 28 septembre 2026 ; il confirme la compilation, pas la recette interactive des parcours.

**Flux traités et statut des preuves :** Julie confirme que les parcours manuels de création, consultation liste/fiche, modification, désactivation, tentative de connexion après désactivation, réactivation et reconnexion ont tous été réalisés. Les tests automatisés backend couvrent en complément la modification de compte, la promotion de rôle, la validation/unicité de l'email, le rejet des champs sensibles, la protection du compte courant, la réactivation limitée à l'entreprise et l'exclusion du mot de passe.

### Phase 6 — Dashboard

- [x] Relever les comptes avant/après création et archivage véhicule, alerte et affectation ; comparer les KPI aux listes (réalisé, confirmation de Julie).
- [x] Comparer les chiffres de deux entreprises et tester les vues admin, manager et comptable (réalisé, confirmation de Julie).
- [x] Vérifier les états de chargement, de liste vide et d'API indisponible (confirmation de Julie).
- [x] Vérifier séparément l'état d'erreur du dashboard (réalisé, confirmation de Julie).

### Phase 7 — Préparation production

- [x] Vérifier séparément les noms de variables des configurations locales dev/test et des variables de production documentées : `backend/.env` contient `MONGO_URI`/`JWT_SECRET`, `backend/.env.test` contient `MONGO_URI_TEST`/`JWT_SECRET`, et `frontend/.env` ne contient aucun secret backend. Les trois fichiers sont ignorés par Git ; aucun fichier de log n'est présent dans le dépôt et aucun indicateur de secret n'a été trouvé dans le bundle `frontend/dist` ni dans l'historique Git inspecté (29 septembre 2026).
- [x] Confirmer que `MONGO_URI` et `JWT_SECRET` ne sont pas configurés dans `frontend/.env` ; les secrets nécessaires restent réservés au backend. Les valeurs n'ont pas été affichées.
- [x] Vérifier dans le code le rate limiting de connexion/inscription, CORS avec liste d'origines explicite, limite JSON à 100 kb, messages génériques en production et arrêt `SIGTERM`/`SIGINT` avec fermeture HTTP/MongoDB et délai de sécurité de 10 s.
- [x] Décision de Julie : conserver Atlas M0 gratuit et utiliser OneDrive pour les exports `mongodump` ; fréquence quotidienne à 20 h, rétention des 7 dernières archives et jusqu'à 4 archives du dimanche.
- [x] Préparer `scripts/backup-atlas-m0.ps1` et `scripts/register-atlas-backup-task.ps1` ; le dossier de destination `backups/` est ignoré par Git et synchronisé avec le projet OneDrive.
- [x] Installer MongoDB Database Tools 100.19.0 dans le profil utilisateur, créer une première archive le 29/09/2026 dans `backups/atlas-m0` et relire intégralement le flux gzip ; enregistrer la tâche Windows `CarLogProAtlasBackup` à 20 h chaque jour (session Windows ouverte, exécution rattrapée après indisponibilité). Le processus OneDrive était lancé au contrôle.
- [x] Julie confirme la synchronisation OneDrive et le test de restauration d'une archive ; le 29/09/2026, trois archives apparaissent avec coches vertes dans l'Explorateur, et la tâche Windows indique `0x0` après exécution. Les archives ne sont pas chiffrées côté client et restent réservées aux données de démonstration.
- [x] Restaurer un dump de la base dédiée `carlog_pro_test` dans `carlog_pro_restore_check_20260928` ; les 5 collections ont le même nombre de documents après restauration. La copie de vérification est isolée de la source.
- [x] Ajouter une CI GitHub Actions autonome dans `.github/workflows/ci.yml` : MongoDB éphémère pour la suite backend, puis build frontend ; aucun secret Atlas/GitHub requis.
- [x] Julie confirme l'exécution réussie de la CI GitHub.
- [x] Préparer les configurations de déploiement selon la cible documentée : `render.yaml` pour l'API Render et `frontend/vercel.json` pour le frontend Vercel ; le guide des paramètres est dans `docs/deploiement-production.md`. Replit reste configuré pour Preview/dev.
- [x] Julie confirme le déploiement Render/Vercel, la configuration des variables de production et le parcours frontend → API en HTTPS ; le rejet CORS a été résolu en définissant `NODE_ENV=production` côté Render.

### Phase 8 — Qualité et livraison

- [x] Exécuter `npm test` et `npm run build` depuis un checkout propre (phase 8 déclarée terminée par Julie).
- [x] Rejouer les parcours complets inscription → connexion → véhicule → alerte → affectation → clôture → statistiques → utilisateur (phase 8 déclarée terminée par Julie).
- [x] Tester deux entreprises, les cinq rôles, erreurs réseau/API et les vues desktop/tablette/mobile (phase 8 déclarée terminée par Julie).
- [x] Contrôler labels, navigation clavier, erreurs lisibles et contrastes ; résoudre l'incohérence de thème validée en Phase 0 (phase 8 déclarée terminée par Julie).
- [x] Mettre à jour les consignes de lancement/déploiement, revoir les dépendances/secrets et obtenir une validation explicite avant publication (phase 8 déclarée terminée par Julie).

**Acceptation :** Julie confirme que tous les contrôles et livrables de la phase 8 ont été réalisés. La phase 8 est donc clôturée le 29 septembre 2026. Les recommandations complémentaires ci-dessous restent un backlog d'amélioration/exploitation et ne bloquent pas cette acceptation.

## Recommandations complémentaires adaptées à CarLog Pro

### Sécurité, authentification et intégrations

- [x] Conserver les secrets hors Git : `.env` local ignoré, variables d'environnement Render en production, aucune clé privée dans le frontend.
- [x] Hacher les mots de passe côté serveur et les exclure des réponses API.
- [x] Appliquer les rôles dans l'API et isoler chaque requête métier par l'entreprise issue du JWT ; phase 1 validée par Julie.
- [x] Revoir le risque XSS lié au jeton JWT dans `localStorage`.
- [x] Conserver validation serveur, rate limiting et verrouillage temporaire des connexions.
- [x] Vérifier que CORS en production ne permet que les origines prévues et confirmer HTTPS au déploiement.
- [x] Confirmation d'adresse email et récupération de compte : formellement hors MVP ; aucun email transactionnel ni parcours de récupération ne doit être ajouté dans ce périmètre.
- [x] Si l'envoi de fichiers est ajouté : valider taille, type réel et emplacement de stockage. A ajouté dans une deuxième version de l'application, pas dans le MVP.

### Base de données, performances et abonnements

- [x] Auditer les index MongoDB pour les références d'entreprise, véhicules, utilisateurs et affectations fréquemment recherchés.
- [x] Rechercher les requêtes répétées dans des boucles et optimiser les chargements de documents liés.
- [x] Vérifier la pagination des listes susceptibles de croître : véhicules, alertes, affectations et utilisateurs.
- [x] Décider si les formules doivent imposer des quotas de véhicules, comptes ou alertes ; aucune limite commerciale par formule n'est fixée ici.
- [x] Cadrer et vérifier les règles de statut d'abonnement : `trial`/`active` accès complet, `past_due` lecture seule sauf création d'alerte, `canceled` accès restreint ; réactivation manuelle jusqu'à Stripe.
- [x] Documenter les changements de schéma Mongoose et prévoir une migration de données lorsqu'elle est nécessaire (les migrations SQL ne s'appliquent pas).
- [x] N'ajouter un cache qu'après mesure d'un besoin de performance et examen du risque de désynchronisation.
- [x] Tester la restauration d'un dump dans une base Atlas isolée ; les cinq collections de la base source et de la copie ont le même nombre de documents.
- [x] Définir pour M0 une destination durable protégée, la fréquence et la rétention des sauvegardes.

### Expérience utilisateur et accessibilité

- [x] Vérifier sur les écrans concernés les états de chargement, erreur API et liste vide ; dashboard : chargement, vide et API indisponible déjà confirmés, état d'erreur restant à vérifier.
- [x] Vérifier les confirmations avant les opérations destructives/sensibles et les retours visibles de réussite ou d'échec des actions.
- [x] Vérifier l'utilisation des formulaires sur mobile et tablette, la lisibilité des champs et la compréhension des erreurs.
- [x] Vérifier dans toute l'application les contrastes, la navigation clavier et les libellés accessibles.
- [x] Décider si l'affichage/masquage des mots de passe améliore les formulaires.
- [x] Thème clair par défaut et bascule vers le thème sombre disponibles et vérifiés.
- [x] Évaluer CTA fixe, recherche globale et bouton de contact selon les besoins ; ajouter animations ou contrôles de défilement uniquement s'ils résolvent un problème d'usage.

### Obligations légales, confidentialité et SEO

- [ ] Préparer et publier mentions légales, CGU et politique de confidentialité finales avant une mise en service réelle. Un brouillon factuel est dans `docs/brouillon-juridique.md` ; l'option d'anonymat de l'éditeur non professionnel et les coordonnées d'hébergement doivent être confirmées. Aucune adresse personnelle ne doit être inventée ou publiée sans accord. **Pages provisoires ajoutées le 30 septembre 2026** dans `frontend/src/pages/PagesLegales.jsx` (accessibles publiquement par ancre depuis la connexion, l'inscription et le dashboard ; bandeau « version provisoire » et mentions « à compléter » visibles). La case reste décochée : statut LCEN et identité transmise à Vercel/Render, adresse légale de Render, mention éventuelle de MongoDB Atlas, régions et transferts hors UE, durées de conservation, base légale RGPD et droit applicable des CGU ne sont pas encore tranchés, et le rendu n'a pas été vérifié visuellement.
- [x] Inventorier les traceurs et n'afficher un bandeau de consentement que si des traceurs soumis au consentement sont utilisés.
- [x] Définir les procédures d'accès, rectification, suppression et les durées de conservation des données personnelles.
- [x] SEO technique de l'application : titre/description français, canonical, Open Graph/Twitter, favicon SVG, `robots.txt`, sitemap racine et image de partage ajoutés. Aucune image informative n'est intégrée à l'interface ; donc aucun `alt` manquant à corriger.
- [x] N'utiliser que des avis, témoignages et chiffres de clientèle réels et autorisés ; ne créer FAQ ou page de remerciement que si elles servent un parcours réel.

### Qualité et exploitation

- [x] Aucune trace `debug`/`console.debug` restante. Les journaux opérationnels sont centralisés en JSON, sans messages, piles, corps, secrets, emails, JWT ou URI MongoDB ; requêtes corrélées avec identifiant et `CF-Ray`.
- [x] Configurer Dependabot hebdomadaire pour npm backend/frontend et GitHub Actions ; les PRs sont revues manuellement, sans fusion automatique.
- [x] `GET /api/health` vérifie MongoDB avec un ping et répond 503 si indisponible ; cette route est le health check Render.
- [ ] Activer les notifications email d'échec dans le tableau de bord Render et configurer/tester un moniteur HTTP externe sur `/api/health` (activation manuelle requise, voir `docs/exploitation-et-observabilite.md`).
- [ ] Mesurer le temps de chargement des listes avec des volumes représentatifs. Aucune image photo/informative n'est utilisée ; le favicon et visuel de partage SVG sont légers.
- [x] Parcours et liens publics examinés dans le code : aucune page marketing ni lien externe de navigation ; l'inscription et la connexion basculent entre elles. À réexaminer si des pages publiques sont ajoutées.
- [x] Les décisions d'abonnement figurent dans `CLAUDE.md` et cette checklist ; les schémas Mongoose et règles de migration sont documentés dans les modèles et `CLAUDE.md`.

### Priorités

1. [x] Politique des statuts d'abonnement cadrée et implémentée ; plafonds par formule encore conditionnels à une décision commerciale.
2. [x] Isolation multi-entreprise validée manuellement en phase 1 ; maintenir une non-régression sur tout nouvel endpoint.
3. [x] Sauvegardes durables M0 vers OneDrive et rétention quotidienne en place ; poursuivre la surveillance des erreurs en production.
4. [ ] Préparer les obligations légales et la gestion des demandes relatives aux données avant la mise en service réelle.
5. [x] Métadonnées, favicon, aperçu social et fichier robots/sitemap de base ajoutés ; la création de contenu public reste dépendante d'un besoin portfolio.

Les cookies de consentement, envoi de fichiers, emails transactionnels/récupération, webhooks de paiement et fonctions marketing restent conditionnels aux choix et fonctionnalités effectivement retenus. Les technologies Supabase/SQL et les clés `NEXT_PUBLIC_*` ne font pas partie de la stack actuelle.

## Ordre de travail recommandé

Les phases 0 à 8 sont terminées et acceptées selon les confirmations de Julie. Il n'y a plus d'étape MVP ouverte dans cette séquence. Les recommandations complémentaires précédentes constituent un backlog post-MVP et ne remettent pas en cause cette acceptation.

Confirmation d'adresse email et récupération de compte sont formellement hors MVP. Stripe, paiements, autres emails transactionnels, PWA, application mobile native, géolocalisation active, exports comptables avancés et maintenance prédictive restent hors de cet ordre MVP, sauf décision produit explicite.


