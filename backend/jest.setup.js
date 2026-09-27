// Charge les variables d'environnement de test AVANT que les fichiers de test
// (et les modules qu'ils importent, comme app.js ou db.js) ne s'exécutent.
// Ainsi NODE_ENV=test et MONGO_URI_TEST sont déjà définis quand connectDB()
// et dotenv.config() de app.js/server.js s'exécutent (dotenv ne réécrit pas
// une variable déjà présente dans process.env, donc l'ordre ici est important).
require('dotenv').config({ path: '.env.test' });
