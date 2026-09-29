// Mongoose est un ODM (Object Data Modeling) pour MongoDB.
// Il facilite l'interaction avec la base en offrant des schemas et des modeles typees.
const mongoose = require('mongoose');
const { ecrire } = require('../utils/journal');

/**
 * Fonction de connexion a la base de donnees MongoDB.
 * Role : etablir la connexion et gerer les erreurs potentielles.
 * Parametres : aucun (utilise MONGO_URI_TEST si NODE_ENV=test, sinon MONGO_URI)
 * Valeur de retour : Promise qui se resout quand la connexion est etablie
 */
const connectDB = async () => {
  try {
    // CORRECTION : selon l'environnement, on utilise une base differente.
    // En test (NODE_ENV=test), on pointe vers MONGO_URI_TEST pour ne jamais
    // toucher aux donnees de developpement ou de production.
    const isTest = process.env.NODE_ENV === 'test';
    const uri = isTest ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;
    const nomVariable = isTest ? 'MONGO_URI_TEST' : 'MONGO_URI';

    if (!uri) {
      throw new Error(
        `La variable d'environnement ${nomVariable} est manquante. Veuillez la définir dans les Secrets/.env.`
      );
    }

    // Mongoose gere automatiquement le pool de connexions.
    await mongoose.connect(uri);
    ecrire('info', 'database_connected', { environment: isTest ? 'test' : 'application' });
  } catch (error) {
    // Les erreurs de connexion peuvent inclure l’URI MongoDB et ses identifiants.
    if (process.env.NODE_ENV !== 'test') {
      ecrire('error', 'database_connection_failed', { errorName: error.name || 'Error' });
    }
    // CORRECTION : process.exit(1) tuerait le process Jest lui-même en test
    // (les tests ne pourraient jamais s'exécuter ni afficher d'échec propre).
    // En test, on relance l'erreur pour que Jest l'affiche normalement.
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
};

// Export de la fonction pour pouvoir l'utiliser dans server.js
module.exports = connectDB;
