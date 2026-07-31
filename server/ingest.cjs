// Ingest dokumen prosedur ke database vektor.
// Pakai: npm run ingest
// Semua file .md / .txt / .pdf di folder docs/ akan diindeks ulang.

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = fs.existsSync(path.join(__dirname, '../.env.local'))
    ? path.join(__dirname, '../.env.local')
    : path.join(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const { ensureSchema, replaceDocument } = require('./rag.cjs');

const DOCS_DIR = path.join(__dirname, '../docs');
const SUPPORTED = ['.md', '.txt', '.pdf'];

async function readDocument(filePath) {
    if (path.extname(filePath).toLowerCase() === '.pdf') {
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: fs.readFileSync(filePath) });
        try {
            const result = await parser.getText();
            return result.text;
        } finally {
            await parser.destroy();
        }
    }
    return fs.readFileSync(filePath, 'utf8');
}

// Judul diambil dari heading pertama, kalau tidak ada pakai nama file
function titleOf(text, fileName) {
    const heading = text.match(/^#\s+(.+)$/m);
    return heading ? heading[1].trim() : path.basename(fileName, path.extname(fileName));
}

// Checklist P2H dibaca langsung dari data aplikasi supaya tidak ada
// salinan terpisah yang bisa basi saat item checklist berubah.
function buildChecklistDoc() {
    const file = path.join(__dirname, '../data/excavatorP2H.ts');
    if (!fs.existsSync(file)) return null;

    const src = fs.readFileSync(file, 'utf8');
    const lines = ['# Checklist P2H Excavator', ''];

    for (const block of src.split(/\btitle:\s*'/).slice(1)) {
        const title = block.slice(0, block.indexOf("'"));
        const labels = [...block.matchAll(/label:\s*'([^']+)'/g)].map(m => m[1]);
        if (!labels.length) continue;
        lines.push(`## ${title}`, '');
        labels.forEach((label, i) => lines.push(`${i + 1}. ${label}`));
        lines.push('');
    }

    return lines.join('\n');
}

function listDocs(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
        .flatMap(entry => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) return listDocs(full);
            return SUPPORTED.includes(path.extname(entry.name).toLowerCase()) ? [full] : [];
        });
}

(async () => {
    if (!process.env.OPENROUTER_API_KEY) {
        console.error('OPENROUTER_API_KEY belum diset di .env');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await ensureSchema(pool);

        const files = listDocs(DOCS_DIR);
        let total = 0;

        // Tanpa --force, dokumen yang sudah terindeks dilewati supaya
        // menambah dokumen baru (atau melanjutkan ingest yang terputus) tetap murah.
        const force = process.argv.includes('--force');
        const indexed = new Set(
            (await pool.query('SELECT DISTINCT source FROM documents')).rows.map(r => r.source)
        );
        const shouldSkip = (source) => !force && indexed.has(source);

        const checklist = buildChecklistDoc();
        if (checklist) {
            const count = await replaceDocument(pool, {
                source: 'checklist-p2h-excavator',
                title: 'Checklist P2H Excavator',
                text: checklist,
            });
            console.log(`- checklist-p2h-excavator (dari data aplikasi): ${count} potongan diindeks`);
            total += count;
        }

        if (!files.length) {
            console.log(`Tidak ada dokumen di ${DOCS_DIR}. Taruh file .md/.txt/.pdf di sana.`);
        }

        let skipped = 0;
        for (const file of files) {
            const source = path.relative(DOCS_DIR, file);
            if (shouldSkip(source)) {
                skipped++;
                continue;
            }
            try {
                const text = await readDocument(file);
                if (!text.trim()) {
                    console.log(`- ${source}: kosong / tidak ada teks (PDF hasil scan?), dilewati`);
                    continue;
                }
                const count = await replaceDocument(pool, { source, title: titleOf(text, file), text });
                console.log(`- ${source}: ${count} potongan diindeks`);
                total += count;
            } catch (err) {
                console.error(`- ${source}: GAGAL - ${err.message}`);
            }
        }

        console.log(`\nSelesai. ${total} potongan baru diindeks, ${skipped} dokumen dilewati (sudah ada).`);
        if (skipped && !force) console.log('Pakai "npm run ingest -- --force" untuk mengindeks ulang semuanya.');
    } finally {
        await pool.end();
    }
})();
