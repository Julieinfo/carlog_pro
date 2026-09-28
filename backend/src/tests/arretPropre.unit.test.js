const mongoose = require('mongoose');
const arreterProprement = require('../utils/arretPropre');

describe('arrêt propre du serveur', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('ferme le serveur puis MongoDB avant de quitter avec le code 0', async () => {
        const ordre = [];
        const server = {
            close: jest.fn((callback) => {
                ordre.push('server.close');
                callback();
            })
        };
        jest.spyOn(mongoose.connection, 'close').mockImplementation(() => {
            ordre.push('mongoose.connection.close');
            return Promise.resolve();
        });
        jest.spyOn(process, 'exit').mockImplementation((code) => {
            ordre.push(`process.exit(${code})`);
        });

        await arreterProprement(server, 'SIGTERM');

        expect(ordre).toEqual([
            'server.close',
            'mongoose.connection.close',
            'process.exit(0)'
        ]);
    });

    it('quitte avec le code 1 si la fermeture du serveur échoue', async () => {
        const server = { close: jest.fn((callback) => callback(new Error('fermeture impossible'))) };
        const fermetureMongo = jest.spyOn(mongoose.connection, 'close').mockResolvedValue();
        const quitter = jest.spyOn(process, 'exit').mockImplementation(() => {});

        await arreterProprement(server, 'SIGTERM');

        expect(fermetureMongo).not.toHaveBeenCalled();
        expect(quitter).toHaveBeenCalledWith(1);
    });

    it('quitte avec le code 1 si la fermeture de MongoDB échoue', async () => {
        const server = { close: jest.fn((callback) => callback()) };
        jest.spyOn(mongoose.connection, 'close').mockRejectedValue(new Error('fermeture impossible'));
        const quitter = jest.spyOn(process, 'exit').mockImplementation(() => {});

        await arreterProprement(server, 'SIGTERM');

        expect(quitter).toHaveBeenCalledWith(1);
    });

    it('ne lance qu’un seul arrêt si le signal est reçu deux fois', async () => {
        let fermerServeur;
        const server = {
            close: jest.fn((callback) => {
                fermerServeur = callback;
            })
        };
        const fermetureMongo = jest.spyOn(mongoose.connection, 'close').mockResolvedValue();
        const quitter = jest.spyOn(process, 'exit').mockImplementation(() => {});

        const premierArret = arreterProprement(server, 'SIGTERM');
        const secondArret = arreterProprement(server, 'SIGINT');
        fermerServeur();
        await Promise.all([premierArret, secondArret]);

        expect(server.close).toHaveBeenCalledTimes(1);
        expect(fermetureMongo).toHaveBeenCalledTimes(1);
        expect(quitter).toHaveBeenCalledTimes(1);
        expect(quitter).toHaveBeenCalledWith(0);
    });
});
