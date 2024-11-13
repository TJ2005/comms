const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'comms',
    password: 'root',
    port: 5432
});

// Database schema initializer
const initializer = `-- Users Table: Stores user information
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,           -- Auto-incrementing user ID
  username VARCHAR(255) NOT NULL   -- User's username
);

-- Sessions Table: Represents a chat session (e.g., chat room)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,           -- Auto-incrementing session ID
  code VARCHAR(255) NOT NULL       -- Unique session code
);

-- User-Sessions Table: Tracks users in sessions and their admin status
CREATE TABLE IF NOT EXISTS user_sessions (
  user_id INTEGER NOT NULL,        -- ID of the user
  session_id INTEGER NOT NULL,     -- ID of the session
  is_admin BOOLEAN DEFAULT FALSE,  -- Whether the user is an admin in this session
  
  PRIMARY KEY (user_id, session_id), -- Composite primary key
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- Foreign key to users
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE -- Foreign key to sessions
);

-- Messages Table: Stores messages sent in sessions
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,           -- Auto-incrementing message ID
  user_id INTEGER NOT NULL,        -- ID of the user who sent the message
  session_id INTEGER NOT NULL,     -- ID of the session in which the message was sent
  content TEXT,                    -- Message content (text or file URL)
  file_url VARCHAR(255),           -- URL of the file (if applicable)
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Time when the message was sent
  message_type VARCHAR(50) NOT NULL,  -- Type of message (e.g., text, file, image)
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- Foreign key to users
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE  -- Foreign key to sessions

);

`

let isInitialized = false;

// Database schema initializer
// This function is ran everytime server runs so if database is dropped or non
// existent we can call it and it should give us the structure
async function initialize() {
    if (!isInitialized) {
        await pool.query(initializer);
        isInitialized = true;
    }
}


// Add a new user
// Our table now has a different username and session table so we create user
// This functions return value can be then used to then link this user to another
// Session

// Notice we are returning id when we never inserted it?
// its because our table has serialized id for now.
async function newUser(username) {
    // Check if the user already exists
    const userCheck = await pool.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
    );

    if (userCheck.rowCount > 0) {
        // User already exists, return their ID
        return userCheck.rows[0].id;
    }

    // Insert the new user and return the ID
    const result = await pool.query(
        `INSERT INTO users (username) VALUES ($1) RETURNING id`,
        [username]
    );
    return result.rows[0].id;
}


// Create a new session with a unique code
// We simply pass the code and we get a serialized session id back
async function createSession(code) {
    const result = await pool.query(
        `INSERT INTO sessions (code) VALUES ($1) RETURNING id`,
        [code]
    );
    return result.rows[0].id;
}


// Join an existing session by adding the user to `user_sessions`
// Since our user_sessions is a merged table of user and session we can simply
// insert the user and session id in this table and we are done adding a user
// into a session
async function joinSession(userId, sessionId) {
    await pool.query(
        `INSERT INTO user_sessions (user_id, session_id) 
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, sessionId]
    );
}


// This function will be called for login
// Main function to handle joining or creating a session
// if user doesnt exist it will create a new user else it will just return the user id
// if session doesnt exist it will create a new session else it will just return the session id
// Note : DBMS Is managing the part wherein if the session doesnt exist and gets created it simply
// Makes the user the admin. This is done by the addAdmin function
// Proceeds to join the user to the session with the join table
async function joinOrCreateSession(username, code) {
    // Ensure the user exists or create them if necessary
    const userId = await newUser(username);

    // Check if the session with the given code exists
    let session = await pool.query(
        `SELECT id FROM sessions WHERE code = $1`,
        [code]
    );

    let sessionId;
    if (session.rowCount === 0) {
        // Session does not exist, create a new session
        sessionId = await createSession(code);
        addAdmin(userId, sessionId);
    } else {
        // Session exists, retrieve the session ID
        sessionId = session.rows[0].id;
    }

    // Add the user to the session (join session)
    await joinSession(userId, sessionId);

    // Return the session ID to confirm the session the user joined or created
    return {sessionId,userId};
}

// Add admin to a session
// Simple Bolean Change for admin column to the user in the session
async function addAdmin(userId, sessionId) {
    await pool.query(
        `UPDATE user_sessions SET is_admin = TRUE 
         WHERE user_id = $1 AND session_id = $2`,
        [userId, sessionId]
    );
}

// Remove admin from a session
async function removeAdmin(userId, sessionId) {
    await pool.query(
        `UPDATE user_sessions SET is_admin = FALSE 
         WHERE user_id = $1 AND session_id = $2`,
        [userId, sessionId]
    );
}



// Send a message
// File_Url is null because its clearly not a file and its type is too text
const sendMessage = async (userId, sessionId, content, fileUrl = null, messageType = 'text') => {
    await pool.query(
        `INSERT INTO messages (user_id, session_id, content, file_url, message_type) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, sessionId, content, fileUrl, messageType]
    );
};

// Get messages from a session along with the username of the sender
const getMessage = async (sessionId, limit = 100) => {
    const result = await pool.query(
        `SELECT messages.id, messages.user_id, messages.session_id, messages.content, 
                messages.file_url, messages.timestamp, messages.message_type, users.username
         FROM messages
         JOIN users ON messages.user_id = users.id
         WHERE messages.session_id = $1
         ORDER BY messages.timestamp DESC
         LIMIT $2`,
        [sessionId, limit]
    );
    return result.rows;
};



module.exports={
    initialize,
    newUser,
    createSession,
    joinOrCreateSession,
    addAdmin,
    removeAdmin,
    sendMessage,
    getMessage
}