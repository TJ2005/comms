const express = require('express');
const { Pool } = require('pg');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();

app.use(cors()); // Enable CORS to allow requests from cross port origins
app.use(express.json());

// Database connection setup
const con = new Pool({
    user: 'postgres',     // replace with your PostgreSQL username
    host: 'localhost',    // or your PostgreSQL server address
    database: 'comms',    // replace with your database name
    password: 'root',     // replace with your database password
    port: 5432,           // PostgreSQL's default port
});

//Handling session_id
function generateToken() {
    return uuidv4();
}

app.post('/api/start-session', async (req, res) => {
    const { username, code } = req.body;

    try {
        const sessionToken = generateToken();
        const updatedSession = await addUserToSession(code, username);

        if (updatedSession) {
            res.json({ sessionToken });  // Send back the generated token
        } else {
            res.status(404).send('Session not found');
        }
    } catch (error) {
        console.error('Error in /api/start-session:', error);
        res.status(500).send('Error generating session token');
    }
});

// Add user to session (update session's usernames in the database)
async function addUserToSession(sessionCode, username) {
    try {
        console.log(`Adding user to session - Code: ${sessionCode}, Username: ${username}`);

        // Check if session exists
        const checkSessionRes = await con.query(
            'SELECT * FROM sessions WHERE session_code = $1',
            [sessionCode]
        );

        if (checkSessionRes.rowCount === 0) {
            // If the session does not exist, create a new one
            const insertSessionRes = await con.query(
                'INSERT INTO sessions (session_code, usernames) VALUES ($1, $2) RETURNING *',
                [sessionCode, JSON.stringify([username])]
            );
            console.log(`Session created with code: ${sessionCode}`);
            return insertSessionRes.rows[0]; // This will include session_id
        } else {
            // If session exists, update the usernames array
            const updateSessionRes = await con.query(
                `UPDATE sessions 
                 SET usernames = jsonb_set(
                     COALESCE(usernames, '[]'::jsonb), 
                     array[jsonb_array_length(COALESCE(usernames, '[]'::jsonb))::text], 
                     $1::jsonb, 
                     true
                 ) 
                 WHERE session_code = $2 
                 RETURNING *`,
                [JSON.stringify(username), sessionCode]
            );

            if (updateSessionRes.rowCount === 0) {
                throw new Error('Failed to update session usernames');
            }
            return updateSessionRes.rows[0]; // This will also include session_id
        }
    } catch (err) {
        console.error('Error adding user to session:', err);
        throw new Error('Database operation failed');
    }
}



// Check if session code exists
async function checkSessionCode(code) {
    try {
        const res = await con.query(
            'SELECT * FROM sessions WHERE session_code = $1',
            [code]
        );
        return res.rowCount > 0; // Returns true if the session code exists
    } catch (err) {
        console.error('Error checking session code:', err);
        return false;
    }
}

// API routes
app.post('/api/add-user-to-session', async (req, res) => {
    const { username, code } = req.body;
    console.log(`Input received - Code: ${code}, Username: ${username}`);
    
    try {
        const updatedSession = await addUserToSession(code, username);
        if (updatedSession) {
            res.sendStatus(200);
        } else {
            res.status(404).send('Session not found');
        }
    } catch (error) {
        console.error('Error in /api/add-user-to-session:', error);
        res.status(500).send('Error adding user to session');
    }
});

app.get('/api/check-session-code', async (req, res) => {
    const { code } = req.query;
    try {
        const exists = await checkSessionCode(code);
        res.json({ exists });
    } catch (error) {
        res.status(500).send('Error checking session code');
    }
});

// WebSocket setup
const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket Server running on port 8080");

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', async (data) => {
    const { action, ...params } = JSON.parse(data);
    try {
      switch (action) {
        case 'joinSession':
          const result = await addUserToSession(params.sessionCode, params.username);
          console.log(`Session Code: ${params.sessionCode}`);
          console.log(`Username: ${params.username}`);
          console.log(`Add User Result: ${result}`);
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown action type' }));
          console.error('Unknown action type');
      }
      ws.send(JSON.stringify({ action, status: 'success' }));
      console.log(`Action "${action}" processed successfully.`);
    } catch (err) {
      console.error(`Error processing action "${action}":`, err);
      ws.send(JSON.stringify({ action, status: 'error', error: err.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

