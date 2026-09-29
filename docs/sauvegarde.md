# CarLog Pro — stratégie de sauvegarde et de restauration (MongoDB Atlas M0)

Rédigé le 29 septembre 2026. Ce document définit la politique de sauvegarde proposée pour la base de production et l'état de sa mise en œuvre. Rien n'est actif tant que la décision de destination (section 3) n'est pas prise et les secrets configurés.

## 1 · Contrainte de départ

Le cluster de production est un **Atlas M0 (gratuit)**. Atlas ne fournit **aucune sauvegarde native** pour ce palier : la seule voie est une sauvegarde logique par `mongodump` / `mongorestore` (documentation Atlas « Back Up, Restore, and Archive Data »). Les paliers Flex (payants) reçoivent des instantanés quotidiens automatiques ; les M10+ ont la sauvegarde continue.

Ce qu'il faut protéger : utilisateurs (noms, emails, hachés bcrypt), entreprises (SIRET, adresses, téléphones), véhicules, alertes, affectations. Ce sont des données personnelles et professionnelles : **toute copie qui sort d'Atlas doit être chiffrée et stockée dans un espace privé.**

## 2 · Politique proposée

| Élément | Valeur | Justification |
|---|---|---|
| Type | Sauvegarde logique complète (`mongodump --archive --gzip`) de la base de production | Seule option compatible M0 ; volume faible (M0 ≤ 512 Mo, en pratique quelques Mo). |
| Fréquence | **Quotidienne** à 03:17 UTC + déclenchement manuel | Perte maximale acceptée (RPO) : 24 h. Un cycle plus court n'apporte rien à un MVP sans trafic continu. |
| Rétention | **30 quotidiennes** (préfixe `quotidien/`) + **12 mensuelles** (préfixe `mensuel/`, copie du 1er du mois) | Couvre l'erreur détectée tard et l'historique annuel, pour un coût de stockage négligeable (< 1 Go). |
| Chiffrement | AES-256 symétrique (`gpg`) avant tout téléversement ; phrase de passe conservée hors GitHub (gestionnaire de mots de passe) | Le stockage ne voit jamais de données en clair ; une fuite du bucket reste inexploitable. |
| Identifiants Atlas | Utilisateur **dédié en lecture seule** (`read` sur la base de production uniquement), URI distincte de `MONGO_URI` | Un secret de sauvegarde compromis ne permet ni écriture ni accès aux autres bases. |
| Destination | Bucket privé S3-compatible (voir décision section 3) avec règles de cycle de vie : expirer `quotidien/` après 30 jours, `mensuel/` après 365 jours | La rétention est appliquée par le stockage lui-même, sans script de purge à maintenir. |
| Exécution | Workflow GitHub Actions `.github/workflows/sauvegarde.yml` (déjà présent, inerte sans secrets) | Pas de serveur à maintenir ; journal d'exécution consultable ; gratuit sur dépôt public. |
| Contrôle d'intégrité | À chaque exécution : `gzip -t` avant chiffrement, déchiffrement de contrôle après | Détecte une archive tronquée avant de l'archiver. |
| Exercice de restauration | **Trimestriel**, dans la base isolée (jamais dans la production) ; résultat consigné ici | Une sauvegarde jamais restaurée n'est pas une sauvegarde. |

Ce que le workflow **ne fait pas** : il n'écrit jamais dans Atlas, ne touche pas à la base de test, n'utilise pas `MONGO_URI` de production (utilisateur dédié), et n'exporte rien tant que les secrets n'existent pas.

## 3 · Décision à prendre : destination du stockage

Le dépôt GitHub est **public**. Les artefacts GitHub Actions d'un dépôt public sont téléchargeables par tout compte GitHub connecté et limités à 90 jours : **ils sont exclus** comme destination, même chiffrés. Trois options restent :

| Option | Coût | Avantages | Compromis |
|---|---|---|---|
| **A. Recommandée — bucket privé S3-compatible** (Cloudflare R2 ou Backblaze B2, 10 Go gratuits ; AWS S3 possible) + workflow GitHub Actions | 0 € dans les volumes du projet | Automatique, rétention gérée par le bucket, journal dans Actions, aucune infrastructure | Créer un compte chez le fournisseur ; les runners GitHub ont des IP variables : l'accès réseau Atlas doit autoriser `0.0.0.0/0` (l'authentification et TLS restent obligatoires ; l'utilisateur est en lecture seule). |
| B. Render Cron Job + même bucket | ≈ 1 $/mois minimum | IP sortantes fixes de Render → liste d'accès Atlas restrictive possible | Nécessite le service Render déjà créé ; petit coût ; script à héberger dans le dépôt. |
| C. `mongodump` manuel hebdomadaire sur le poste de Julie, archive chiffrée sur un disque/cloud personnel | 0 € | Aucun service tiers, aucune ouverture réseau | Dépend de la discipline ; RPO 7 jours ; pas de journal ; pas « durable » au sens de l'automatisation. |
| D. Passer le cluster en Atlas Flex | à partir d'environ 8 $/mois (facturation à l'usage) | Instantanés quotidiens natifs, restauration en un clic, rien à maintenir | Coût récurrent ; rétention et fréquence imposées par Atlas ; ne remplace pas une copie hors Atlas. |

**Recommandation : A**, avec un compte Cloudflare R2 (aucun frais de sortie) ou Backblaze B2. Si l'ouverture `0.0.0.0/0` sur Atlas est refusée, prendre **B**.

Quel que soit le choix, la seule information à me communiquer ensuite est « option retenue » : aucune valeur de secret ne doit transiter par le chat.

## 4 · Mise en œuvre de l'option A (à faire par Julie)

1. **Atlas** : Database Access → créer l'utilisateur `carlog_sauvegarde` avec le rôle intégré `read` limité à la base de production ; Network Access → autoriser `0.0.0.0/0` (ou passer à l'option B).
2. **Stockage** : créer un bucket privé (ex. `carlog-pro-sauvegardes`), une clé d'accès limitée à ce bucket, et deux règles de cycle de vie : préfixe `quotidien/` → suppression après 30 jours ; préfixe `mensuel/` → suppression après 365 jours.
3. **Phrase de passe** : générer une phrase longue (`openssl rand -base64 48`), la ranger dans un gestionnaire de mots de passe. **Sans elle, aucune archive n'est restaurable.**
4. **GitHub** : Settings → Secrets and variables → Actions → créer les secrets listés en tête de `.github/workflows/sauvegarde.yml`. Les définir vaut autorisation d'exporter.
5. **Première exécution** : Actions → « Sauvegarde MongoDB » → Run workflow ; vérifier la présence de l'objet dans le bucket ; noter la date ici (section 6).
6. Un workflow planifié est désactivé par GitHub après 60 jours sans activité sur le dépôt : le réactiver si nécessaire (Actions → workflow → Enable).

## 5 · Restauration

La restauration ponctuelle dans une **base isolée** (jamais la production) a été indiquée comme réussie par Julie ; sa trace n'est pas dans ce dépôt (date, base cible et résultat à reporter en section 6). Elle n'a pas été rejouée dans cette session, faute d'accès à un MongoDB et conformément à la consigne.

Procédure de référence (à exécuter depuis un poste disposant des Database Tools) :

```bash
# 1. Récupérer et déchiffrer l'archive (la phrase de passe est demandée, jamais passée en argument)
aws s3 cp s3://<bucket>/quotidien/<fichier>.archive.gz.gpg . --endpoint-url <endpoint>
gpg --decrypt --output sauvegarde.archive.gz <fichier>.archive.gz.gpg

# 2. Restaurer dans la base isolée en renommant l'espace de noms (ne jamais viser la base de production)
mongorestore --uri "<URI de la base isolée>" --archive=sauvegarde.archive.gz --gzip \
  --nsFrom '<base_prod>.*' --nsTo '<base_isolee>.*' --drop

# 3. Contrôler : nombre de documents par collection, connexion d'un compte de test, puis supprimer les fichiers locaux
rm -f sauvegarde.archive.gz <fichier>.archive.gz.gpg
```

Ordre de grandeur attendu (RTO) : quelques minutes pour une base de taille M0. Une restauration **en production** n'est envisagée qu'après restauration réussie en base isolée et validation explicite de Julie.

## 6 · Journal des sauvegardes et exercices

| Date | Opération | Cible | Résultat | Qui |
|---|---|---|---|---|
| (antérieure, date à préciser) | Restauration ponctuelle de test | Base isolée | Réussie (déclaré par Julie ; trace à joindre) | Julie |
| 2026-09-29 | Définition de la politique, workflow préparé (inactif) | — | Aucun export effectué ; décision de destination en attente | Agent |

## 7 · Limites connues

- L'étape de chiffrement `gpg` du workflow n'a pas pu être exécutée dans l'environnement de préparation (binaire absent) ; elle repose sur `gnupg` préinstallé sur les runners `ubuntu-24.04`. La première exécution manuelle sert de test.
- `mongodump` est une copie logique : pas de restauration à un instant précis (point-in-time). Seul un palier Atlas M10+ l'offre.
- Le journal d'exécution GitHub est public (dépôt public) : il ne contient ni secret ni nom de bucket (masqués), mais révèle l'existence et l'horaire des sauvegardes. Acceptable pour ce projet ; à reconsidérer si le dépôt reçoit des données réelles de clients.
