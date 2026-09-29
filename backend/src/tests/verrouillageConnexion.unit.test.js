const {
    estVerrouille,
    enregistrerEchec,
    reinitialiser
} = require('../utils/verrouillageConnexion');

describe('verrouillageConnexion', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-09-28T10:00:00Z'));
        reinitialiser('connu@example.com');
        reinitialiser('inconnu@example.com');
    });

    afterEach(() => jest.useRealTimers());

    it('verrouille au cinquième échec et déverrouille après 15 minutes', () => {
        for (let i = 0; i < 4; i += 1) enregistrerEchec('connu@example.com');
        expect(estVerrouille('CONNU@example.com')).toBe(false);
        enregistrerEchec('connu@example.com');
        expect(estVerrouille('connu@example.com')).toBe(true);

        jest.advanceTimersByTime(15 * 60 * 1000);
        expect(estVerrouille('connu@example.com')).toBe(false);
    });

    it('réinitialiser remet les échecs à zéro', () => {
        for (let i = 0; i < 5; i += 1) enregistrerEchec('connu@example.com');
        reinitialiser('connu@example.com');
        for (let i = 0; i < 4; i += 1) enregistrerEchec('connu@example.com');
        expect(estVerrouille('connu@example.com')).toBe(false);
    });

    it('applique la même règle aux emails connus et inconnus', () => {
        for (let i = 0; i < 5; i += 1) {
            enregistrerEchec('connu@example.com');
            enregistrerEchec('inconnu@example.com');
        }
        expect(estVerrouille('connu@example.com')).toBe(true);
        expect(estVerrouille('inconnu@example.com')).toBe(true);
    });

    it('borne le nombre d’emails mémorisés en évincant les entrées les plus anciennes', () => {
        enregistrerEchec('ancienne@example.com');
        for (let i = 0; i < 10_000; i += 1) enregistrerEchec(`client-${i}@example.com`);

        // La première entrée a été évincée à la capacité maximale, ses échecs ne s'accumulent donc pas.
        for (let i = 0; i < 4; i += 1) enregistrerEchec('ancienne@example.com');
        expect(estVerrouille('ancienne@example.com')).toBe(false);
    });
});
