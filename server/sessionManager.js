const express = require('express');
const { Pool } = require('pg');
const WebSocket = require('ws');
const app = express();
app.use(express.json());

// Database connection setup
const con = new Pool({
    user: 'postgres',     // replace with your PostgreSQL username
    host: 'localhost',    // or your PostgreSQL server address
    database: 'comms',    // replace with your database name
    password: 'root',     // replace with your database password
    port: 5432,           // PostgreSQL's default port
});

// Add user to session (update session's usernames in the database)
async function addUserToSession(sessionCode, username) {
    try {
        const res = await con.query(
            'UPDATE sessions SET usernames = jsonb_set(usernames, array[jsonb_array_length(usernames)::text], $1) WHERE session_code = $2 RETURNING *',
            [JSON.stringify(username), sessionCode]
        );
        console.log('Session updated with new username:', res.rows[0]);
    } catch (err) {
        console.error('Error adding user to session:', err);
        throw err; // Add this line to ensure the error is propagated
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
        await addUserToSession(code, username);
        res.sendStatus(200);
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
          await addUserToSession(params.sessionCode, params.username);
          console.log(`Session Code: ${params.sessionCode}`);
          console.log(`Username: ${params.username}`);
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
