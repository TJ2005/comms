const initializer = `CREATE TABLE IF NOT EXISTS sessions (
    session_id SERIAL PRIMARY KEY,
    session_code VARCHAR(255) UNIQUE NOT NULL,
    usernames JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    message_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(session_id),
    username VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    session_id INTEGER PRIMARY KEY REFERENCES sessions(session_id),
    expiry TIMESTAMP,
    attachments BOOLEAN,
    max_members INTEGER
);

CREATE TABLE IF NOT EXISTS session_admins (
    session_admin_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(session_id) ON DELETE CASCADE,
    admin_username VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_code ON sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_session_id_messages ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_id_settings ON settings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_id_admins ON session_admins(session_id);`;

const { Pool } = require('pg');
const pool = new Pool({
    user: 'username',
    host: 'localhost',
    database: 'comms',
    password: 'pass',
    port: 5432,
});

// initialized state flag
let isInitialized = false;


async function initialize() {
    if (isInitialized) {
        console.log('Database is already initialized.');
        return;
    }
    try {
        await pool.query(initializer);
        isInitialized = true;
        console.log('Database initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

async function checkSessionCode(sessionCode) {
    const res = await pool.query('SELECT * FROM sessions WHERE session_code = $1', [sessionCode]);
    return res.rows.length > 0;
}

async function createSession(sessionCode, username) {
    const usernames = [username];
    const sessionRes = await pool.query(
        'INSERT INTO sessions (session_code, usernames) VALUES ($1, $2) RETURNING *',
        [sessionCode, JSON.stringify(usernames)]
    );
    const sessionId = sessionRes.rows[0].session_id;

    // Add the initial admin to the session_admins table
    await pool.query(
        'INSERT INTO session_admins (session_id, admin_username) VALUES ($1, $2)',
        [sessionId, username]
    );

    return sessionRes.rows[0];
}

// Function to add an admin to a session
async function addAdmin(sessionId, adminUsername) {
    const res = await pool.query(
        'INSERT INTO session_admins (session_id, admin_username) VALUES ($1, $2) RETURNING *',
        [sessionId, adminUsername]
    );
    return res.rows[0];
}

// Function to remove an admin from a session
async function removeAdmin(sessionId, adminUsername) {
    const res = await pool.query(
        'DELETE FROM session_admins WHERE session_id = $1 AND admin_username = $2 RETURNING *',
        [sessionId, adminUsername]
    );
    return res.rowCount > 0; // Returns true if an admin was removed
}

// Function to get all admins for a session
async function getAdmins(sessionId) {
    const res = await pool.query(
        'SELECT admin_username FROM session_admins WHERE session_id = $1',
        [sessionId]
    );
    return res.rows.map(row => row.admin_username);
}

async function addMessage(sessionId, username, content) {
    const res = await pool.query(
        'INSERT INTO messages (session_id, username, message_content) VALUES ($1, $2, $3) RETURNING *',
        [sessionId, username, content]
    );
    return res.rows[0];
}

async function getMessages(sessionId) {
    const res = await pool.query('SELECT * FROM messages WHERE session_id = $1 ORDER BY timestamp', [sessionId]);
    return res.rows;
}

async function createSettings(sessionId, expiry, attachments, maxMembers) {
    const res = await pool.query(
        'INSERT INTO settings (session_id, expiry, attachments, max_members) VALUES ($1, $2, $3, $4) RETURNING *',
        [sessionId, expiry, attachments, maxMembers]
    );
    return res.rows[0];
}

async function updateSetting(sessionId, settingKey, settingValue) {
    const res = await pool.query(
        `UPDATE settings SET ${settingKey} = $1 WHERE session_id = $2 RETURNING *`,
        [settingValue, sessionId]
    );
    return res.rows[0];
}

async function getSettings(sessionId) {
    const res = await pool.query('SELECT * FROM settings WHERE session_id = $1', [sessionId]);
    return res.rows[0];
}

module.exports = { 
    checkSessionCode, 
    createSession, 
    addAdmin, 
    removeAdmin, 
    getAdmins, 
    addMessage, 
    getMessages, 
    createSettings, 
    getSettings,
    updateSetting,
    initialize
};