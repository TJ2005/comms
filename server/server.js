const express = require('express');
const app = express();
const WebSocket = require('ws');
const {
  checkSessionCode,
  createSession,
  addAdmin,
  removeAdmin,
  getAdmins,
  addMessage,
  getMessages,
  upsertSettings,
  getSettings,
  initialize,
  joinSession
} = require('./database');

// Initialize the database
initialize().then(() => {
  console.log('Database initialized successfully.');
}).catch(err => {
  console.error('Error initializing database:', err);
});

app.use(express.static('public')); // Serve static files from public folder

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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
