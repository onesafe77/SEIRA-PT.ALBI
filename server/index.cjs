const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const envPath = fs.existsSync(path.join(__dirname, '../.env.local'))
    ? path.join(__dirname, '../.env.local')
    : path.join(__dirname, '../.env');
require('dotenv').config({ path: envPath });
const { sendWhatsApp } = require('./fonnte.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully at:', res.rows[0].now);

        // Ensure inspections table exists
        const createTableQuery = `
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
        `;
        pool.query(createTableQuery).catch(e => console.error('Error creating table:', e));

        // Add approval columns if they don't exist
        const alterQueries = [
            `ALTER TABLE inspections ADD COLUMN IF NOT EXISTS approval_token VARCHAR(64)`,
            `ALTER TABLE inspections ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP`,
            `ALTER TABLE inspections ADD COLUMN IF NOT EXISTS supervisor_signature TEXT`,
        ];
        alterQueries.forEach(q => pool.query(q).catch(e => console.error('Alter table:', e.message)));
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { employeeId, password } = req.body;
    console.log(`Login attempt for: ${employeeId} from ${req.ip}`);

    try {
        const result = await pool.query('SELECT * FROM users WHERE employee_id = $1', [employeeId]);

        if (result.rows.length === 0) {
            console.log(`[LOGIN FAILED] ID Pegawai tidak ditemukan: ${employeeId}`);
            return res.status(401).json({ message: 'ID Pegawai tidak ditemukan' });
        }

        const user = result.rows[0];

        // Simple password check (should use bcrypt in production)
        if (password !== user.password) {
            console.log(`[LOGIN FAILED] Kata sandi salah untuk: ${employeeId}`);
            return res.status(401).json({ message: 'Kata sandi salah' });
        }

        console.log(`[LOGIN SUCCESS] User: ${employeeId} (${user.name})`);

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign(
            { id: user.id, employeeId: user.employee_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                employeeId: user.employee_id,
                name: user.name,
                position: user.position,
                department: user.department,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Submit Inspection
app.post('/api/inspections', async (req, res) => {
    const { metadata, answers } = req.body;

    try {
        // Generate unique approval token (shorter for cleaner link)
        const approvalToken = crypto.randomBytes(12).toString('hex');

        const query = `
            INSERT INTO inspections (unit_code, date, shift, hm_start, operator_id, operator_name, status, answers, approval_token)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;

        // Determine status based on R (Rusak) in answers
        const hasCritical = Object.values(answers).some(val => val === 'R');
        const status = hasCritical ? 'NOT READY' : 'READY';

        const values = [
            metadata.unitCode,
            metadata.date,
            metadata.shift,
            metadata.hmStart || 0,
            metadata.operatorId || 'unknown',
            metadata.operatorName,
            status,
            JSON.stringify(answers),
            approvalToken
        ];

        const result = await pool.query(query, values);
        const inspectionId = result.rows[0].id;

        // Build approval link (Use FRONTEND_URL from env or fallback to localhost)
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const approvalLink = `${baseUrl}/approve/${approvalToken}`;

        // Helper to format phone number (08... -> 628...)
        const formatPhone = (num) => {
            let clean = num.replace(/[^0-9]/g, '');
            if (clean.startsWith('0')) {
                clean = '62' + clean.slice(1);
            }
            return clean;
        };

        // Send WhatsApp notification to pengawas
        let waNotified = false;
        try {
            let phone = process.env.PENGAWAS_PHONE || '';
            let pengawasName = 'Pengawas';

            if (!phone) {
                const pengawasResult = await pool.query(
                    `SELECT name, phone_number FROM users WHERE role = 'admin' AND position ILIKE '%GL%' LIMIT 1`
                );
                if (pengawasResult.rows.length > 0) {
                    phone = pengawasResult.rows[0].phone_number;
                    pengawasName = pengawasResult.rows[0].name;
                }
            }

            if (phone) {
                const formattedPhone = formatPhone(phone);
                const message = `📋 *NOTIFIKASI P2H - PERLU APPROVAL*\n\n` +
                    `Operator *${metadata.operatorName}* telah menyelesaikan inspeksi P2H.\n\n` +
                    `📌 *Detail Inspeksi:*\n` +
                    `• Unit: ${metadata.unitCode}\n` +
                    `• Tanggal: ${metadata.date}\n` +
                    `• Shift: ${metadata.shift}\n` +
                    `• HM: ${metadata.hmStart || '-'}\n` +
                    `• Status: ${status}\n` +
                    `• ID Inspeksi: #${inspectionId}\n\n` +
                    `✅ *Klik link untuk approve:*\n` +
                    `${approvalLink}\n\n` +
                    `_Link ini aman dan khusus untuk inspeksi ini._\n` +
                    `Terima kasih 🙏`;

                const waResult = await sendWhatsApp(formattedPhone, message);
                waNotified = waResult.success;
                console.log(`[WA] Notification to ${pengawasName} (${formattedPhone}): ${waNotified ? 'SENT' : 'FAILED'}`);
            } else {
                console.log('[WA] No pengawas phone configured');
            }
        } catch (waErr) {
            console.error('[WA] Notification error:', waErr.message);
        }

        res.status(201).json({
            message: 'Inspeksi berhasil disimpan',
            id: inspectionId,
            waNotified
        });
    } catch (err) {
        console.error('Submission error:', err);
        res.status(500).json({ message: 'Gagal menyimpan inspeksi' });
    }
});

// Get Inspection History
app.get('/api/inspections', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[DEBUG] User form token:', user);
        console.log('[DEBUG] Role check (operator):', user.role === 'operator');

        let query = 'SELECT * FROM inspections';
        let values = [];

        // If user is an operator, only show their own inspections
        // Assuming role 'operator' is strict. adjust logic if roles are mixed.
        if (user.role === 'operator') {
            console.log('[DEBUG] Filtering for operator:', user.employeeId);
            query += ' WHERE operator_id = $1';
            values.push(user.employeeId);
        } else {
            console.log('[DEBUG] Showing all data for role:', user.role);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inspections:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ============================================================
// APPROVAL ENDPOINTS
// ============================================================

// Get inspection data by approval token (public, no auth)
app.get('/api/approve/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const result = await pool.query(
            'SELECT id, unit_code, date, shift, hm_start, operator_name, status, answers, approved_at, supervisor_signature, created_at FROM inspections WHERE approval_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inspeksi tidak ditemukan' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Approve GET error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Submit approval (pengawas signs)
app.post('/api/approve/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { supervisorSignature } = req.body;

        if (!supervisorSignature) {
            return res.status(400).json({ message: 'Tanda tangan pengawas diperlukan' });
        }

        // Check if already approved
        const check = await pool.query(
            'SELECT id, approved_at FROM inspections WHERE approval_token = $1',
            [token]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Inspeksi tidak ditemukan' });
        }

        if (check.rows[0].approved_at) {
            return res.status(400).json({ message: 'Inspeksi sudah diapprove sebelumnya' });
        }

        // Update with approval
        await pool.query(
            `UPDATE inspections SET approved_at = NOW(), supervisor_signature = $1, status = 'APPROVED' WHERE approval_token = $2`,
            [supervisorSignature, token]
        );

        res.json({ message: 'Approval berhasil! Terima kasih.' });
    } catch (err) {
        console.error('Approve POST error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// New Summary Endpoint for Admin/Pengawas
app.get('/api/inspections/summary', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: 'No token provided' });

        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (user.role !== 'admin' && user.role !== 'pengawas') {
            return res.status(403).json({ message: 'Access denied: Admin/Pengawas only' });
        }

        // 1. Total Stats
        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'READY') as ready,
                COUNT(*) FILTER (WHERE status = 'NOT READY') as not_ready,
                COUNT(*) FILTER (WHERE status = 'APPROVED') as approved
            FROM inspections
        `;
        const statsResult = await pool.query(statsQuery);

        // 2. Weekly Trend
        const trendQuery = `
            SELECT 
                TO_CHAR(date, 'Dy') as day,
                COUNT(*) as count
            FROM inspections
            WHERE date > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY date
            ORDER BY date ASC
        `;
        const trendResult = await pool.query(trendQuery);

        // 3. Critical Units (Recent Not Ready)
        const criticalQuery = `
            SELECT unit_code, operator_name, date, status
            FROM inspections
            WHERE status = 'NOT READY'
            ORDER BY created_at DESC
            LIMIT 5
        `;
        const criticalResult = await pool.query(criticalQuery);

        res.json({
            stats: statsResult.rows[0],
            trend: trendResult.rows,
            critical: criticalResult.rows
        });
    } catch (err) {
        console.error('Summary error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        console.log("AI Chat Request:", message);

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ message: 'OpenAI API Key not configured' });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "Anda adalah asisten Safety Officer (P2H & ERT) yang ahli. Jawablah dengan ringkas, ramah, dan profesional dalam Bahasa Indonesia. Bantu pengguna menganalisa masalah unit atau prosedur keselamatan." },
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo", // or gpt-4o if available/preferred
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ message: 'Gagal menghubungi AI: ' + err.message });
    }
});

// Profile Stats Endpoint
app.get('/api/profile/stats', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        // Note: token payload might have 'employeeId' or 'id'. Check login endpoint.
        // Login signs: { id: user.id, employeeId: user.employee_id, role: user.role }
        const employeeId = user.employeeId;

        const query = `
            SELECT 
                COUNT(*) as count,
                MAX(hm_start) as max_hm,
                MIN(hm_start) as min_hm
            FROM inspections 
            WHERE operator_id = $1
        `;

        const result = await pool.query(query, [employeeId]);
        const data = result.rows[0];

        const count = parseInt(data.count) || 0;
        let hours = 0;

        // Simple heuristic for hours if hm data is available
        if (data.max_hm && data.min_hm) {
            hours = parseFloat(data.max_hm) - parseFloat(data.min_hm);
        }

        // Fallback: if hours is 0 but count > 0 (maybe only 1 inspection), assume 12h per inspection
        // This makes sure user sees *some* "Actual" data even with 1 inspection
        if (hours === 0 && count > 0) {
            hours = count * 12;
        }

        // Calculate Rank based on activity
        let rankScore = '3.5';
        if (count > 50) rankScore = '5.0';
        else if (count > 20) rankScore = '4.8';
        else if (count > 10) rankScore = '4.5';
        else if (count > 0) rankScore = '4.0';

        // Fetch user photo
        const userRes = await pool.query('SELECT photo_url FROM users WHERE employee_id = $1', [employeeId]);
        const photoUrl = userRes.rows[0]?.photo_url || null;

        res.json({
            inspections: count,
            hours: Math.round(hours),
            rank: rankScore,
            photoUrl: photoUrl
        });

    } catch (err) {
        console.error('Profile Stats error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Upload Profile Photo (Base64)
app.post('/api/profile/upload', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const { image } = req.body; // Base64 string

        if (!image) return res.status(400).json({ message: 'No image provided' });

        // Ensure public/uploads exists
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save base64 to file
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid image format' });
        }

        const ext = matches[1].split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `profile_${user.employeeId}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, buffer);

        const photoUrl = `/uploads/${filename}`;

        // Update DB
        await pool.query('UPDATE users SET photo_url = $1 WHERE employee_id = $2', [photoUrl, user.employeeId]);

        res.json({ message: 'Foto berhasil diperbarui', photoUrl });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Gagal mengupload foto' });
    }
});

// Serve static frontend files in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        // Only fallback if not an API request
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
