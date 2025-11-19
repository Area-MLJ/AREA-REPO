import Database from 'better-sqlite3';

// Créer la connexion
const db = new Database(process.env.DATABASE_PATH);

// Exporter
export default db;

