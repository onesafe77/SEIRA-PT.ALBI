const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config({ path: './server/.env' }); // Ensure correct path to .env

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected successfully.');
        client.release();

        console.log('Starting migration...');

        // Find inspections with missing approval_token
        const res = await pool.query('SELECT id FROM inspections WHERE approval_token IS NULL');
        console.log(`Found ${res.rowCount} inspections without tokens.`);

        for (const row of res.rows) {
            const token = crypto.randomBytes(32).toString('hex');
            await pool.query('UPDATE inspections SET approval_token = $1 WHERE id = $2', [token, row.id]);
            console.log(`Updated inspection #${row.id} with token.`);
        }

        console.log('Migration complete.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        pool.end();
    }
}

migrate();
