const { ecrire, contexteRequete } = require('./journal');

const repondreErreur = (res, erreur, statut = 500, req) => {
    if (process.env.NODE_ENV !== 'test') {
        ecrire('error', 'handled_api_error', {
            ...(req ? contexteRequete(req) : {}),
            status: statut,
            errorName: erreur.name || 'Error'
        });
    }
    const message = process.env.NODE_ENV === 'production'
        ? 'Une erreur interne est survenue.'
        : erreur.message;
    return res.status(statut).json({ message });
};

module.exports = repondreErreur;
