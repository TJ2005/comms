var initializer = `CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    session_code VARCHAR(255) UNIQUE NOT NULL,
    admin VARCHAR(255) NOT NULL,
    usernames JSONB NOT NULL
);

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(session_id),
    username VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    setting_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(session_id),
    expiry TIMESTAMP,
    attachments BOOLEAN,
    max_members INTEGER
);

CREATE INDEX idx_session_code ON sessions(session_code);
CREATE INDEX idx_session_id_messages ON messages(session_id);
CREATE INDEX idx_session_id_settings ON settings(session_id);`

const { Pool } = require('pg');
const pool = new Pool({
    user: 'username',
    host: 'localhost',
    database: 'comms',
    password: 'pass',
    port: 5432,
});

async function initialize() {
    const res = await pool.query(initializer);
    console.log(res);
}


async function checkSessionCode(sessionCode) {
    const res = await pool.query('SELECT * FROM sessions WHERE session_code = $1', [sessionCode]);
    return res.rows.length > 0;
}

async function createSession(sessionCode, username) {
    const usernames = [username];
    const res = await pool.query(
        'INSERT INTO sessions (session_code, admin, usernames) VALUES ($1, $2, $3) RETURNING *',
        [sessionCode, username, JSON.stringify(usernames)]
    );
    return res.rows[0];
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

module.exports = { checkSessionCode, createSession, addMessage, getMessages, createSettings, getSettings };