jest.mock('mongoose', () => ({ connect: jest.fn() }));

const mongoose = require('mongoose');
const connectDB = require('../config/db');

describe('Configuration MongoDB', () => {
    it('ne journalise pas les détails d’une URI MongoDB en cas d’échec de connexion', async () => {
        const previous = {
            nodeEnv: process.env.NODE_ENV,
            mongoUri: process.env.MONGO_URI
        };
        const secret = 'mongodb://user:password-secret@host.example/db';
        const log = jest.spyOn(console, 'error').mockImplementation(() => {});
        const exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined);
        process.env.NODE_ENV = 'production';
        process.env.MONGO_URI = secret;
        mongoose.connect.mockRejectedValue(new Error(`Connection failed for ${secret}`));

        try {
            await connectDB();
            expect(log.mock.calls.flat().join(' ')).not.toContain('password-secret');
            expect(log).toHaveBeenCalledWith(expect.not.stringContaining(secret));
            expect(exit).toHaveBeenCalledWith(1);
        } finally {
            if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
            else process.env.NODE_ENV = previous.nodeEnv;
            if (previous.mongoUri === undefined) delete process.env.MONGO_URI;
            else process.env.MONGO_URI = previous.mongoUri;
            log.mockRestore();
            exit.mockRestore();
        }
    });
});
