const mongoose = require('mongoose');
const Affectation = require('../models/Affectation');
const connectDB = require('../config/db');

let entreprise;

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await Affectation.init();
});

beforeEach(() => {
    entreprise = new mongoose.Types.ObjectId();
});

afterEach(async () => {
    await Affectation.deleteMany({ entreprise });
});

afterAll(async () => {
    await mongoose.connection.close();
});

function affectation(vehicule, conducteur) {
    return {
        entreprise,
        vehicule,
        conducteur,
        kmDebut: 0,
        statut: 'en_cours'
    };
}

async function expectOneConcurrentInsertToBeRejected(documents) {
    const results = await Promise.allSettled(documents.map((document) => Affectation.create(document)));
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);

    const erreurs = results.filter((result) => result.status === 'rejected');
    expect(erreurs).toHaveLength(1);
    expect(erreurs[0].reason.code).toBe(11000);
}

describe('Contraintes MongoDB des affectations concurrentes', () => {
    it('empêche deux affectations simultanées du même véhicule', async () => {
        const vehicule = new mongoose.Types.ObjectId();
        await expectOneConcurrentInsertToBeRejected([
            affectation(vehicule, new mongoose.Types.ObjectId()),
            affectation(vehicule, new mongoose.Types.ObjectId())
        ]);
    });

    it('empêche deux affectations simultanées du même conducteur', async () => {
        const conducteur = new mongoose.Types.ObjectId();
        await expectOneConcurrentInsertToBeRejected([
            affectation(new mongoose.Types.ObjectId(), conducteur),
            affectation(new mongoose.Types.ObjectId(), conducteur)
        ]);
    });
});
