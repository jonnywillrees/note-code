import { MongoClient, ServerApiVersion } from 'mongodb';

const connectionString = process.env.ATLAS_URI || '';

const client = new MongoClient(connectionString, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let dbPromise;

const initializeDB = async () => {
    try {
        const connection = await client.connect();
        const db = connection.db('code-snippet-app');
        return db;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

dbPromise = initializeDB();

const getDB = async () => {
    if (!dbPromise) {
        throw new Error('Database connection not initialized.');
    }
    return dbPromise;
};

export default getDB;