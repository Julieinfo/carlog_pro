# CarLog Pro Mobile

Application mobile Android-first qui complète le SaaS CarLog Pro pour la consultation de flotte, les alertes et les actions terrain.

> Projet portfolio : ne publiez aucune donnée personnelle, aucun secret et aucun identifiant fonctionnel.

## Fonctionnalités

- Authentification auprès de l'API Express et session persistante via Expo SecureStore
- Tableau de bord mobile et navigation par onglets
- Recherche et filtres de véhicules
- Alertes avec priorités et états
- Fiche véhicule et actions terrain
- Enregistrement d'un plein et signalement d'anomalie
- Ajout local d'une photo depuis la galerie ou l'appareil photo
- Profil, déconnexion et thèmes clair/sombre
- États de chargement, erreurs réseau et expiration de session

Les écrans encore en cours de synchronisation avec l'API utilisent explicitement des données fictives centralisées dans `src/data/`.

## Stack

- React Native 0.86
- Expo SDK 57
- TypeScript
- Expo Router
- Expo SecureStore
- Expo ImagePicker
- API Node.js, Express et MongoDB
- Android Studio Emulator

## Installation

Prérequis : Node.js LTS, Android Studio avec un émulateur Android, et un compte de test CarLog Pro si l'API réelle est utilisée.

```bash
npm install
npx expo start
```

Pour l'émulateur Android :

```bash
npx expo start --android
```

Les variables publiques sont documentées dans `.env.example`. Elles contiennent uniquement l'URL de l'API et le nom de l'application :

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
EXPO_PUBLIC_APP_NAME=CarLog Pro
```

Sur un téléphone physique, remplacez `10.0.2.2` par l'adresse IP LAN du PC ou utilisez l'URL de l'API de production configurée localement. Ne mettez jamais de secret dans une variable `EXPO_PUBLIC_*`.

## Contrôles qualité

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo export --platform web
```

## Build APK de portfolio

La configuration [eas.json](./eas.json) contient un profil `preview` destiné à une distribution interne :

```bash
npx eas-cli@latest build --platform android --profile preview
```

Cette commande nécessite une authentification EAS et n'est pas lancée automatiquement. L'APK généré doit être partagé via une distribution interne, pas committé dans Git.

## Documentation de démonstration

Voir [docs/DEMO.md](./docs/DEMO.md) pour le parcours conseillé, les règles de sécurité et la commande de build.

## Architecture

```text
src/app/       Écrans et routes Expo Router
src/components  Composants UI réutilisables
src/contexts/   Session et état d'authentification
src/data/       Données fictives en attente de synchronisation API
src/services/   API, session et médias
src/types/      Types TypeScript
src/utils/      Fonctions utilitaires
assets/         Identité visuelle et ressources Expo
docs/           Documentation de démonstration
```

## Décision produit

- **Web** : administration complète, analyses, rapports et exports.
- **Mobile** : consultation, alertes et actions rapides sur le terrain.

## Évolutions prévues

- Synchronisation complète des listes et actions avec l'API
- Upload persistant des photos
- Notifications push
- Fonctionnement hors connexion
- Biométrie
- Publication Android et iOS

## Auteure

Julie De Castro
