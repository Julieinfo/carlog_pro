# Déploiement production — CarLog Pro

La cible **Render pour l'API** et **Vercel pour le frontend** est déployée ; Julie confirme la validation de la production. Les fichiers de configuration versionnés documentent la configuration déclarative, tandis que les variables restent configurées dans les tableaux de bord des hébergeurs.

## Render — API Express

Le Blueprint [render.yaml](../render.yaml) décrit le service `carlog-pro-api` : racine `backend`, installation de production, démarrage par `npm start`, contrôle de santé `/api/health`, arrêt propre et déploiements automatiques désactivés.

Lors de la création/synchronisation du Blueprint dans Render :

1. Relier le dépôt GitHub et sélectionner `render.yaml`.
2. Fournir `MONGO_URI` avec un utilisateur MongoDB de production à privilèges minimaux. La base doit être distincte des bases dev et test. Restreindre l'accès réseau Atlas aux plages de sortie Render prévues ; ne pas ouvrir Atlas à `0.0.0.0/0` comme solution permanente.
3. Définir `NODE_ENV=production` et `FRONTEND_URL` avec l'origine HTTPS exacte de production Vercel (schéma et hôte, sans chemin ni barre oblique finale). Le mode production active la liste CORS de production.
4. Render génère une valeur aléatoire pour `JWT_SECRET`. La conserver dans Render ; ne pas la copier dans Vercel, GitHub ou le frontend.
5. Choisir et confirmer le plan d'hébergement selon le budget. Le plan n'est pas imposé dans le Blueprint.

## Vercel — frontend Vite

Créer le projet Vercel à partir du même dépôt avec **Root Directory** `frontend`. Le fichier [vercel.json](../frontend/vercel.json) fixe l'installation `npm ci`, la compilation `npm run build` et le dossier publié `dist`.

Configurer `VITE_API_URL` pour l'environnement Production avec l'URL publique de l'API Render suivie de `/api` (ex. `https://<service-render>.onrender.com/api`). Cette URL est une configuration publique intégrée au bundle ; elle ne doit contenir aucun secret. Ne pas activer les URLs de preview avant d'avoir décidé si elles seront ajoutées à la liste d'origines CORS du backend. La valeur de production et le parcours frontend → API ont été vérifiés par Julie.

Après la première création des deux services :

1. Copier l'origine HTTPS Vercel de production dans `FRONTEND_URL` côté Render, puis redémarrer/redéployer l'API.
2. Vérifier `GET https://<service-render>.onrender.com/api/health` et l'accès frontend → API depuis le domaine Vercel.
3. Contrôler dans les paramètres des deux hébergeurs que les domaines utilisent HTTPS et que les variables attendues existent, sans copier leur contenu dans des tickets, journaux ou le dépôt.
4. Confirmer que les données de production sont isolées de dev/test et que l'accès réseau Atlas est restreint.

Ces vérifications nécessitent les comptes, le domaine réellement attribué et les paramètres de connexion de production. Elles ne sont pas considérées comme exécutées par la seule présence des fichiers de configuration.

## CI GitHub Actions

Le workflow [ci.yml](../.github/workflows/ci.yml) lance les tests backend contre un service MongoDB éphémère et compile le frontend. Il utilise uniquement des valeurs de test jetables ; aucun secret Atlas ou secret de production n'est requis dans GitHub Actions. Julie confirme que l'exécution distante GitHub est verte.

## Sauvegardes durables MongoDB M0

Julie conserve Atlas M0 gratuit et utilise OneDrive comme destination. M0 n'offre pas les snapshots Atlas Cloud Backup ; le test de restauration d'une archive OneDrive est confirmé par Julie.

Deux scripts sont préparés : [backup-atlas-m0.ps1](../scripts/backup-atlas-m0.ps1) exporte `backend/.env` → `MONGO_URI` vers `backups/atlas-m0`, et [register-atlas-backup-task.ps1](../scripts/register-atlas-backup-task.ps1) enregistre une tâche Windows quotidienne à 20 h. Le dossier `backups/` est exclu de Git et se trouve dans le projet synchronisé par OneDrive. La rétention conserve les 7 dernières sauvegardes et jusqu'à 4 sauvegardes du dimanche.

État opérationnel confirmé le 29/09/2026 :

1. MongoDB Database Tools 100.19.0 a été installé sous `%LOCALAPPDATA%\MongoDBDatabaseTools\100.19.0` ; les scripts détectent ce chemin sans exiger de modification du `PATH`.
2. Trois archives étaient visibles dans `backups/atlas-m0` avec coches vertes OneDrive ; la tâche Windows `CarLogProAtlasBackup` a réussi (`0x0`) et reste programmée à 20 h chaque jour, lorsque la session Windows est ouverte.
3. Julie confirme que le test de restauration et les validations de rétention/quota ont été réalisés.

Les archives sont compressées mais pas chiffrées côté client ; utiliser uniquement des données de démonstration dans cette configuration.
