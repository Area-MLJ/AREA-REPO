import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_PATH);

export default db;
