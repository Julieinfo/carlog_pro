const repondreErreur = (res, erreur, statut = 500) => {
    const message = process.env.NODE_ENV === 'production'
        ? 'Une erreur interne est survenue.'
        : erreur.message;
    return res.status(statut).json({ message });
};

module.exports = repondreErreur;
