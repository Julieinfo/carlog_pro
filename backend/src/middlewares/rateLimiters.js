const rateLimit = require('express-rate-limit');

const MESSAGE_RATE_LIMIT = 'Connexion temporairement indisponible. Réessayez plus tard.';

function creerLimiteur({ windowMs, max, skipSuccessfulRequests }) {
    return rateLimit({
        windowMs,
        limit: max,
        skipSuccessfulRequests,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: MESSAGE_RATE_LIMIT }
    });
}

const limiteurConnexion = creerLimiteur({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true
});

const limiteurInscription = creerLimiteur({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: false
});

module.exports = { creerLimiteur, limiteurConnexion, limiteurInscription };
