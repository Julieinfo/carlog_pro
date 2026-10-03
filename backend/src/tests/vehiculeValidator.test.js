const express = require('express');
const request = require('supertest');
const Vehicule = require('../models/Vehicule');
const {
    validateCreerVehicule,
    validateModifierVehicule
} = require('../middlewares/validators/vehiculeValidator');

const app = express();
app.use(express.json());
app.post('/api/vehicules', validateCreerVehicule, (req, res) => res.status(201).json({ ok: true }));
app.put('/api/vehicules/:id', validateModifierVehicule, (req, res) => res.status(200).json({ ok: true }));

const vehiculeValide = {
    immatriculation: 'AB-123-CD',
    marque: 'Renault',
    modele: 'Master',
    typeVehicule: 'utilitaire',
    ptac: 3500
};

describe('Validation du PTAC véhicule', () => {
    it('rejette la création lorsque le PTAC vaut 0', async () => {
        const response = await request(app)
            .post('/api/vehicules')
            .send({ ...vehiculeValide, ptac: 0 });

        expect(response.statusCode).toBe(400);
        expect(response.body.erreurs).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Le PTAC doit être un nombre entier supérieur à 0.' })
        ]));
    });

    it('rejette la création lorsque le PTAC est absent', async () => {
        const { ptac, ...sansPtac } = vehiculeValide;
        const response = await request(app).post('/api/vehicules').send(sansPtac);

        expect(response.statusCode).toBe(400);
        expect(response.body.erreurs).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Le PTAC est obligatoire.' })
        ]));
    });

    it('accepte la création avec un PTAC positif et rejette 0 en modification', async () => {
        const creation = await request(app).post('/api/vehicules').send(vehiculeValide);
        const modification = await request(app).put('/api/vehicules/vehicule-1').send({ ptac: 0 });

        expect(creation.statusCode).toBe(201);
        expect(modification.statusCode).toBe(400);
        expect(modification.body.erreurs).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Le PTAC doit être un nombre entier supérieur à 0.' })
        ]));
    });

    it('rejette également un PTAC à 0 au niveau du modèle Mongoose', async () => {
        const vehicule = new Vehicule({
            entreprise: '507f1f77bcf86cd799439011',
            ...vehiculeValide,
            ptac: 0
        });

        await expect(vehicule.validate()).rejects.toMatchObject({
            errors: {
                ptac: expect.objectContaining({ message: 'Le PTAC doit être supérieur à 0.' })
            }
        });
    });
});
