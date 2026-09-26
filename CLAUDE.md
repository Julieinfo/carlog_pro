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

- **Personnalité de la marque :** [à définir]
- **Couleur principale :** [#______]
- **Couleur d'accent :** [#______]
- **Fond / surfaces :** [ex. fond sombre, cartes contrastées]
- **Typo titres :** [ex. Inter 600-700]
- **Typo texte :** [ex. Inter 400-500]
- **Rayons :** [ex. 8-12px]
- **Interdits :** [ex. dégradés criards, plus de 2 couleurs d'accent]

Règle : chaque nouvel écran React respecte ces tokens. Si un écran a besoin d'un style qui n'existe pas ici, tu me le proposes AVANT.

## 5 · Sécurité (non négociable)

1. **Connecté ne veut pas dire autorisé.** Chaque route vérifie `protect` (JWT valide) **et** `authorize(...)` si le rôle doit être restreint. L'`entrepriseId` vient toujours de `req.user.entreprise` (token), jamais du body ou de l'URL — c'est la faille n°1 en multi-tenant : un utilisateur qui changerait un ID pour lire les données d'une autre entreprise.

2. **Base verrouillée.** Filtrage `entreprise` systématique sur toutes les requêtes Mongoose (find, findById + vérification, update, delete). Un modèle sans filtre entreprise devient accessible à tous le jour où un ID fuite.

3. **Aucun secret dans le code ni sur GitHub.** `MONGO_URI`, `JWT_SECRET` vivent dans `.env` / `.env.test`, tous deux dans `.gitignore`. Un secret poussé une fois doit être **révoqué**, pas seulement supprimé.

4. **Validation côté serveur** de toute donnée entrante (express-validator), même si le frontend valide déjà. Ce qui n'est vérifié que dans le navigateur n'est pas vérifié.

5. **Whitelist des champs modifiables.** Sur les `PUT`, on extrait explicitement les champs autorisés (déjà en place sur véhicules/alertes/affectations) — jamais `req.body` passé tel quel à `findByIdAndUpdate`, pour empêcher l'injection de champs comme `entreprise`, `role`, `resoluePar`.

6. **Ce qui coûte de l'argent ou peut être abusé est limité.** Inscription, connexion, envoi d'email (à venir) : limiter par IP/compte et par heure.

7. **Mini-audit à chaque feature qui touche des données :** « qu'est-ce qu'un attaquant pourrait faire avec ça (accéder aux données d'une autre entreprise, escalader son rôle) ? ». Tu corriges avant de me montrer.

## 6 · Definition of done

Une feature est finie quand :

- [ ] `npm run build` (frontend) et les tests Jest passent **en local**
- [ ] Elle marche avec l'API en environnement de test, pas seulement en dev
- [ ] Elle respecte la DA (section 4)
- [ ] Elle respecte la sécurité (section 5), **testée avec un compte d'une autre entreprise et/ou un rôle non autorisé**
- [ ] Les cas vides, le chargement et les erreurs sont traités côté frontend
- [ ] Je l'ai testée moi-même avec une vraie donnée
- [ ] Le journal (section 7) est à jour

## 7 · Journal du projet

> Ajoute une ligne ici à chaque session. Date · ce qui a été fait · ce qui reste.

- [2026-09] · Backend terminé (auth, CRUD véhicules/alertes/affectations, stats, RBAC, Swagger, tests Jest) · Frontend React en cours (dashboard connecté à l'API)

## 8 · Pièges connus

| Symptôme | Cause réelle | Règle |
|---|---|---|
| Un utilisateur voit les données d'une autre entreprise | `entreprise` pris depuis le body/URL au lieu de `req.user.entreprise` | Toujours filtrer depuis le token décodé |
| Un champ interdit (`entreprise`, `role`, `resoluePar`) est modifié via l'API | `req.body` passé tel quel à `findByIdAndUpdate` | Toujours passer par une whitelist explicite de champs |
| Connexion MongoDB Atlas échoue en DNS | URI SRV mal résolue | Utiliser l'URI longue (sans SRV) en dépannage |
| Les variables d'environnement sont vides en local | `.env` / `.env.test` non chargés ou mal nommés | Vérifier `dotenv.config()` et le `NODE_ENV` utilisé |
| Double hash du mot de passe | Hook `pre('save')` déclenché même sans modification du mot de passe | Toujours vérifier `isModified('motDePasse')` avant de hasher |

- [ajoute les tiens ici]

---

*Adapté du starter CLAUDE.md générique pour coller au projet réel CarLog Pro (Express/MongoDB/React, SaaS B2B de gestion de flotte).*
