# Démonstration CarLog Pro Mobile

## Parcours recommandé

1. Ouvrir l'application.
2. Se connecter avec un compte réel du SaaS ou un compte de test dédié.
3. Consulter le tableau de bord.
4. Ouvrir la liste des véhicules puis une fiche véhicule.
5. Consulter les alertes et ouvrir une alerte.
6. Ouvrir l'action d'enregistrement d'un plein.
7. Ouvrir le signalement d'anomalie et tester la galerie ou l'appareil photo.
8. Supprimer la photo sélectionnée avant de quitter le formulaire.
9. Ouvrir le profil et tester le mode clair/sombre.
10. Se déconnecter puis vérifier le retour à la connexion.

## Données et sécurité

Les données de démonstration affichées par les écrans qui ne sont pas encore synchronisés avec l'API sont fictives. Ne jamais publier d'identifiant, de mot de passe, de JWT ou de variable d'environnement dans une capture, une vidéo ou ce dépôt.

La connexion utilise l'API Express de CarLog Pro. Utiliser un compte de test dédié pour une démonstration publique, jamais un compte personnel ou administrateur de production.

## Build APK de prévisualisation

Après validation dans Expo Go :

```bash
npx eas-cli@latest build --platform android --profile preview
```

La build `preview` produit un APK installable pour une distribution interne. Ne pas committer l'APK dans le dépôt.
