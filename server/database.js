const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'comms',
    password: 'root',
    port: 5432
});

let isInitialized = false;

// Database schema initializer
const initializer = `
CREATE TABLE IF NOT EXISTS sessions (
    session_code VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usernames TEXT[]
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS session_admins (
    session_code VARCHAR(255) REFERENCES sessions(session_code) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (session_code, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    message_id SERIAL PRIMARY KEY,
    session_code VARCHAR(255) REFERENCES sessions(session_code) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    message_content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    session_code VARCHAR(255) PRIMARY KEY REFERENCES sessions(session_code),
    attachments BOOLEAN DEFAULT TRUE,
    max_members INTEGER DEFAULT 10
);

-- Indexes for optimized queries
CREATE INDEX IF NOT EXISTS idx_session_code_messages ON messages(session_code);
CREATE INDEX IF NOT EXISTS idx_session_code_users ON sessions(session_code);`;

// Initialize the database schema
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

// Check if the session code exists in the database
async function checkSessionCode(sessionCode) {
    const res = await pool.query('SELECT 1 FROM sessions WHERE session_code = $1', [sessionCode]);
    return res.rowCount > 0;
}

// Add a new user, if they don't exist, and return user data
async function addUser(username) {
    const res = await pool.query(
        'INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username RETURNING *',
        [username]
    );
    return res.rows[0];
}

// Create a new session and add the user as an admin
async function createSession(sessionCode, username) {
    const user = await addUser(username); // Add the user if they don’t exist
    await pool.query(
        'INSERT INTO sessions (session_code, usernames) VALUES ($1, ARRAY[$2])',
        [sessionCode, username]
    );
    await addAdmin(sessionCode, user.user_id); // Adds the user as an admin
    console.log(`Session ${sessionCode} created with admin ${username}`);
    return { sessionCode, admin: user.username };
}

// Join an existing session or create it if it doesn’t exist
async function joinOrCreateSession(sessionCode, username) {
    const sessionExists = await checkSessionCode(sessionCode);

    if (!sessionExists) {
        // If session does not exist, create it and add user as admin
        return await createSession(sessionCode, username);
    } else {
        // If session exists, add the user to the usernames array
        await pool.query(
            'UPDATE sessions SET usernames = array_append(usernames, $1) WHERE session_code = $2',
            [username, sessionCode]
        );
        const user = await addUser(username);
        await addUserToSession(sessionCode, user.user_id); // Add user to session
        console.log(`User ${username} joined existing session ${sessionCode}`);
        return { sessionCode, username: user.username };
    }
}

// Add a user to a session (used in joinOrCreateSession)
async function addUserToSession(sessionCode, userId) {
    const res = await pool.query(
        'INSERT INTO session_users (session_code, user_id) VALUES ($1, $2) RETURNING *',
        [sessionCode, userId]
    );
    return res.rows[0];
}

// Add an admin to a session
async function addAdmin(sessionCode, userId) {
    const res = await pool.query(
        'INSERT INTO session_admins (session_code, user_id) VALUES ($1, $2) RETURNING *',
        [sessionCode, userId]
    );
    return res.rows[0];
}

// Remove an admin from a session
async function removeAdmin(sessionCode, userId) {
    const res = await pool.query(
        'DELETE FROM session_admins WHERE session_code = $1 AND user_id = $2 RETURNING *',
        [sessionCode, userId]
    );
    return res.rowCount > 0;
}

// Get all admins of a session
async function getAdmins(sessionCode) {
    const res = await pool.query(
        'SELECT u.username FROM session_admins sa JOIN users u ON sa.user_id = u.user_id WHERE sa.session_code = $1',
        [sessionCode]
    );
    return res.rows.map(row => row.username);
}

// Add a message to a session
async function addMessage(sessionCode, userId, content) {
    const res = await pool.query(
        'INSERT INTO messages (session_code, user_id, message_content) VALUES ($1, $2, $3) RETURNING *',
        [sessionCode, userId, content]
    );
    return res.rows[0];
}

// Retrieve all messages for a session
async function getMessages(sessionCode) {
    const res = await pool.query(
        'SELECT m.*, u.username FROM messages m JOIN users u ON m.user_id = u.user_id WHERE m.session_code = $1 ORDER BY m.timestamp',
        [sessionCode]
    );
    return res.rows;
}

// Create or update settings for a session
async function upsertSettings(sessionCode, attachments, maxMembers) {
    const res = await pool.query(
        `INSERT INTO settings (session_code, attachments, max_members)
        VALUES ($1, $2, $3)
        ON CONFLICT (session_code) DO UPDATE SET attachments = EXCLUDED.attachments, max_members = EXCLUDED.max_members RETURNING *`,
        [sessionCode, attachments, maxMembers]
    );
    return res.rows[0];
}

// Get session settings
async function getSettings(sessionCode) {
    const res = await pool.query('SELECT * FROM settings WHERE session_code = $1', [sessionCode]);
    return res.rows[0];
}

// Initialize the database
module.exports = {
    initialize,
    checkSessionCode,
    createSession,
    joinOrCreateSession,
    addAdmin,
    removeAdmin,
    getAdmins,
    addMessage,
    getMessages,
    upsertSettings,
    getSettings
};
