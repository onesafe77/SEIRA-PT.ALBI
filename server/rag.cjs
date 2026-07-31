const OpenAI = require('openai');

const EMBED_MODEL = process.env.EMBED_MODEL || 'openai/text-embedding-3-small';
const EMBED_DIM = 1536;

const client = () => new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

// Potong paragraf yang lebih panjang dari batas chunk
function splitLong(text, size) {
    if (text.length <= size) return [text];
    const out = [];
    for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
    return out;
}

// Pecah dokumen jadi potongan ~900 karakter, dipotong di batas paragraf
// dengan sedikit overlap supaya konteks antar potongan tidak hilang.
function chunkText(text, size = 900, overlap = 150) {
    const clean = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const paragraphs = clean.split(/\n\n+/).flatMap(p => splitLong(p.trim(), size));

    const chunks = [];
    let current = '';

    for (const p of paragraphs) {
        if (!p) continue;
        if (current && current.length + p.length + 2 > size) {
            chunks.push(current.trim());
            current = current.slice(-overlap) + '\n\n' + p;
        } else {
            current += (current ? '\n\n' : '') + p;
        }
    }
    if (current.trim()) chunks.push(current.trim());

    return chunks.filter(c => c.length > 30);
}

// pgvector menerima vektor dalam bentuk string '[0.1,0.2,...]'
const toVector = (arr) => `[${arr.join(',')}]`;

async function embed(inputs) {
    const openai = client();
    const vectors = [];

    // Batch supaya request tidak terlalu besar
    for (let i = 0; i < inputs.length; i += 96) {
        const batch = inputs.slice(i, i + 96);
        const res = await openai.embeddings.create({ model: EMBED_MODEL, input: batch });
        vectors.push(...res.data.map(d => d.embedding));
    }

    return vectors;
}

async function ensureSchema(pool) {
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            source TEXT NOT NULL,
            title TEXT,
            chunk_index INT NOT NULL,
            content TEXT NOT NULL,
            embedding vector(${EMBED_DIM}),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (source, chunk_index)
        )
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS documents_embedding_idx
        ON documents USING hnsw (embedding vector_cosine_ops)
    `);
}

// Ganti seluruh isi satu dokumen (idempotent, aman dijalankan berulang)
async function replaceDocument(pool, { source, title, text }) {
    const chunks = chunkText(text);
    if (!chunks.length) return 0;

    const vectors = await embed(chunks);

    await pool.query('DELETE FROM documents WHERE source = $1', [source]);
    for (let i = 0; i < chunks.length; i++) {
        await pool.query(
            `INSERT INTO documents (source, title, chunk_index, content, embedding)
             VALUES ($1, $2, $3, $4, $5::vector)`,
            [source, title, i, chunks[i], toVector(vectors[i])]
        );
    }

    return chunks.length;
}

// Cari potongan prosedur paling relevan dengan pertanyaan
async function search(pool, query, limit = 5) {
    const [vector] = await embed([query]);
    const { rows } = await pool.query(
        `SELECT source, title, content, 1 - (embedding <=> $1::vector) AS score
         FROM documents
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        [toVector(vector), limit]
    );
    return rows;
}

module.exports = { chunkText, embed, ensureSchema, replaceDocument, search, EMBED_MODEL };
