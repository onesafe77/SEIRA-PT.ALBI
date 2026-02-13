import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './server/.env' });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkDb() {
    try {
        console.log('Checking inspections table...');
        console.log('DB URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');
        const res = await pool.query('SELECT * FROM inspections');
        console.log('Count:', res.rowCount);
        if (res.rowCount > 0) {
            console.log('Sample Row:', res.rows[0]);
        }
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
}

checkDb();
