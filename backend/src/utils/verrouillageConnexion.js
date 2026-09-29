const FENETRE_ECHECS_MS = 15 * 60 * 1000;
const DUREE_VERROUILLAGE_MS = 15 * 60 * 1000;
const SEUIL_ECHECS = 5;
const TAILLE_MAX = 10000;
const INTERVALLE_PURGE_MS = 60 * 1000;

const verrouillages = new Map();
let prochainNettoyage = 0;

function normaliserEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function purgerEntrees(expiration, tout = false) {
    if (!tout && expiration < prochainNettoyage) return;

    for (const [email, entree] of verrouillages) {
        if (entree.verrouilleJusqua && entree.verrouilleJusqua <= expiration) {
            verrouillages.delete(email);
            continue;
        }
        entree.echecs = entree.echecs.filter((horodatage) => expiration - horodatage < FENETRE_ECHECS_MS);
        if (!entree.echecs.length && !entree.verrouilleJusqua) verrouillages.delete(email);
    }
    prochainNettoyage = expiration + INTERVALLE_PURGE_MS;
}

function obtenirEntree(email, maintenant) {
    const entree = verrouillages.get(email);
    if (!entree) return undefined;

    if (entree.verrouilleJusqua) {
        if (entree.verrouilleJusqua > maintenant) return entree;
        verrouillages.delete(email);
        return undefined;
    }

    entree.echecs = entree.echecs.filter((horodatage) => maintenant - horodatage < FENETRE_ECHECS_MS);
    if (!entree.echecs.length) {
        verrouillages.delete(email);
        return undefined;
    }
    return entree;
}

function estVerrouille(email) {
    const maintenant = Date.now();
    purgerEntrees(maintenant);
    const entree = obtenirEntree(normaliserEmail(email), maintenant);
    return Boolean(entree?.verrouilleJusqua && entree.verrouilleJusqua > maintenant);
}

function enregistrerEchec(email) {
    const maintenant = Date.now();
    purgerEntrees(maintenant);
    const cle = normaliserEmail(email);
    let entree = obtenirEntree(cle, maintenant);

    if (!entree) {
        if (verrouillages.size >= TAILLE_MAX) {
            purgerEntrees(maintenant, true);
            while (verrouillages.size >= TAILLE_MAX) {
                verrouillages.delete(verrouillages.keys().next().value);
            }
        }
        entree = { echecs: [], verrouilleJusqua: null };
    }

    entree.echecs.push(maintenant);
    if (entree.echecs.length >= SEUIL_ECHECS) {
        entree.verrouilleJusqua = maintenant + DUREE_VERROUILLAGE_MS;
    }

    // Déplacer l'entrée à la fin pour évincer les clés les moins récemment actives en cas de saturation.
    verrouillages.delete(cle);
    verrouillages.set(cle, entree);
}

function reinitialiser(email) {
    verrouillages.delete(normaliserEmail(email));
}

module.exports = { estVerrouille, enregistrerEchec, reinitialiser };
