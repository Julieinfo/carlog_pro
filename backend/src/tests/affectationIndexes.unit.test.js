const Affectation = jest.requireActual('../models/Affectation');

describe('Index d’unicité des affectations actives', () => {
    it('empêche une affectation en cours en double pour un véhicule ou un conducteur', () => {
        const indexes = Affectation.schema.indexes();
        const uniquesActifs = indexes.filter(([, options]) =>
            options.unique && options.partialFilterExpression?.statut === 'en_cours'
        );

        expect(uniquesActifs).toEqual(expect.arrayContaining([
            [expect.objectContaining({ entreprise: 1, vehicule: 1 }), expect.objectContaining({ unique: true })],
            [expect.objectContaining({ entreprise: 1, conducteur: 1 }), expect.objectContaining({ unique: true })]
        ]));
    });
});
