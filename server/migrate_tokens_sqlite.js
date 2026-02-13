const Database = require('better-sqlite3');
const crypto = require('crypto');
require('dotenv').config();

const db = new Database('server/database.sqlite', { verbose: console.log });

try {
    console.log('Starting migration...');

    // Check if column exists, if not add it
    try {
        db.prepare('SELECT approval_token FROM inspections LIMIT 1').get();
    } catch (e) {
        console.log('Adding approval_token column...');
        db.prepare('ALTER TABLE inspections ADD COLUMN approval_token TEXT').run();
    }

    // Find inspections with missing approval_token
    const rows = db.prepare('SELECT id FROM inspections WHERE approval_token IS NULL OR approval_token = ""').all();
    console.log(`Found ${rows.length} inspections without tokens.`);

    const updateStmt = db.prepare('UPDATE inspections SET approval_token = ? WHERE id = ?');

    const transaction = db.transaction((items) => {
        for (const row of items) {
            const token = crypto.randomBytes(32).toString('hex');
            updateStmt.run(token, row.id);
            console.log(`Updated inspection #${row.id} with token.`);
        }
    });

    transaction(rows);
    console.log('Migration complete.');
} catch (e) {
    console.error('Migration failed:', e);
} finally {
    db.close();
}
