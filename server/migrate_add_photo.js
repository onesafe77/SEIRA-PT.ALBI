const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const migrate = async () => {
    try {
        console.log('Migrating users table...');
        console.log('Database URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS photo_url TEXT;
        `);

        console.log('Migration successful: photo_url column added.');
        process.exit(0);
    } catch (err) {
        console.error('Migration error full:', err);
        process.exit(1);
    }
};

migrate();
