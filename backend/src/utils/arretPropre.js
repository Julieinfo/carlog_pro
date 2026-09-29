const mongoose = require('mongoose');
const { ecrire } = require('./journal');

const arretsParServeur = new WeakMap();

function arreterProprement(server, signal) {
    if (arretsParServeur.has(server)) return arretsParServeur.get(server);

    ecrire('info', 'server_shutdown_started', { signal });

    let terminer;
    const arret = new Promise((resolve) => {
        terminer = resolve;
    });
    arretsParServeur.set(server, arret);

    let termine = false;
    const finir = (code) => {
        if (termine) return;
        termine = true;
        clearTimeout(minuteur);
        process.exit(code);
        terminer(code);
    };

    const minuteur = setTimeout(() => {
        ecrire('error', 'server_shutdown_timeout');
        finir(1);
    }, 10000);
    minuteur.unref();

    try {
        server.close((erreur) => {
            if (erreur) {
                finir(1);
                return;
            }

            Promise.resolve()
                .then(() => mongoose.connection.close())
                .then(() => finir(0))
                .catch(() => finir(1));
        });
    } catch {
        finir(1);
    }

    return arret;
}

module.exports = arreterProprement;
const { ecrire } = require('./journal');
