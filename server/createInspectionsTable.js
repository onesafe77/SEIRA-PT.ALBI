const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const run = async () => {
    try {
        console.log('Creating inspections table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inspections (
                id SERIAL PRIMARY KEY,
                unit_code VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                shift VARCHAR(20) NOT NULL,
                hm_start NUMERIC,
                operator_id VARCHAR(50) NOT NULL,
                operator_name VARCHAR(100),
                status VARCHAR(20) DEFAULT 'Draft',
                answers JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "inspections" created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

run();
