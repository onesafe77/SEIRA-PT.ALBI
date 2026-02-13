const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const init = async () => {
    try {
        console.log('Connecting to database...');

        // Recreate users table
        await pool.query('DROP TABLE IF EXISTS users CASCADE');
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                position VARCHAR(100),
                department VARCHAR(100),
                phone_number VARCHAR(20),
                role VARCHAR(20) DEFAULT 'operator',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table "users" recreated.');

        const employees = [
            ['C-035923', 'Ahmad Muzhaffar Ishak', '12345678', 'Operasional', 'Produksi', '0822-9933-6886', 'operator'],
            ['C-080729', 'Muhda Isnandar', '12345678', 'Safety Officer', 'HSE', '0821-5479-1737', 'admin'],
            ['C-079211', 'Syamsudin Noor', '12345678', 'Operator Excavator', 'Produksi', '0813-5188-4212', 'operator'],
            ['C-081220', 'Viatun Wadur Atammaani', '12345678', 'Admin', 'Produksi', '0821-5437-7604', 'admin'],
            ['C-080728', 'Bahtiar Muslim', '12345678', 'Mekanik', 'Plant', '0821-4999-5940', 'operator'],
            ['C-085251', 'Nanda Wahyu Hermawan', '12345678', 'GL Produksi', 'Produksi', '0813-1930-6560', 'admin'],
            ['C-084651', 'Sartono', '12345678', 'Operator Excavator', 'Produksi', '0857-5456-5541', 'operator'],
            ['C-000001', 'Ahmad Junaidy Ishak', '12345678', 'PJO', 'Management', '0853-9658-8470', 'admin']
        ];

        for (const [id, name, pass, pos, dept, phone, role] of employees) {
            await pool.query(`
                INSERT INTO users (employee_id, name, password, position, department, phone_number, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [id, name, pass, pos, dept, phone, role]);
        }

        console.log('Import complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

init();
