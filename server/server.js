const express = require('express');
const app = express();
const WebSocket = require('ws');
const { Pool } = require('pg');

app.use(express.json());

const con = new Pool({
    user: 'postgres',     // replace with your PostgreSQL username
    host: 'localhost',    // or your PostgreSQL server address
    database: 'comms',    // replace with your database name
    password: 'root',     // replace with your database password
    port: 5432,           // PostgreSQL's default port
});

// Insert message into Messages table (commented out the storeMessage function)
/*
async function storeMessage(username, message, timestamp) {
    const insertQuery = `INSERT INTO Messages (SessionID, Username, Message, Timestamp) VALUES ($1, $2, $3, $4)`;
    try {
        await con.query(insertQuery, [sessionId, username, message, timestamp]);
        console.log('Message stored in database');
    } catch (err) {
        console.error('Error storing message:', err);
    }
}
*/

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
  console.log('Client connected');

  ws.on('message', async (data) => {
    const { action, ...params } = JSON.parse(data);  // Destructure to get action and params

    try {
      let response;
      switch (action) {
        case 'createSession':
          // Creates a new session and adds an initial user/admin
          response = await createSession(params.sessionCode, params.username);
          break;

        case 'joinSession':
          // Adds a new user to an existing session
          response = await joinSession(params.sessionCode, params.username);
          console.log(params.sessionCode);
          console.log(params.username);
          break;

        case 'addAdmin':
          // Adds a new admin to a session
          response = await addAdmin(params.sessionCode, params.userId);
          break;

        case 'removeAdmin':
          // Removes an admin from a session
          response = await removeAdmin(params.sessionCode, params.userId);
          break;

        case 'addMessage':
          // Adds a new message to a session
          response = await addMessage(params.sessionCode, params.userId, params.messageContent);
          break;

        case 'getMessages':
          // Retrieves all messages for a session
          response = await getMessages(params.sessionCode);
          break;

        case 'updateSettings':
          // Updates session settings
          response = await upsertSettings(params.sessionCode, params.attachments, params.maxMembers);
          break;

        case 'getSettings':
          // Retrieves session settings
          response = await getSettings(params.sessionCode);
          break;

        default:
          response = { error: 'Unknown action type' };
      }

      // Send response to the client
      ws.send(JSON.stringify({ action, status: 'success', data: response }));
      console.log(`Action "${action}" processed successfully.`);

      // Optionally broadcast to all clients (e.g., for addMessage)
      if (action === 'addMessage') {
        const broadcastMessage = JSON.stringify({ username: params.username, message: params.messageContent, timestamp: new Date() });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastMessage);
            console.log('Message broadcasted to client:', broadcastMessage);
          }
        });
      }

    } catch (err) {
      console.error(`Error processing action "${action}":`, err);
      ws.send(JSON.stringify({ action, status: 'error', error: err.message }));
    }
  });
     
  ws.on('error', (error) => {
    console.error('Error occurred:', error);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ${PORT}');
});
