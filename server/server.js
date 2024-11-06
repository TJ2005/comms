const express = require('express');
const app = express();
const WebSocket = require('ws');
const addMessage = require('./database');


const {
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
} = require('./database');

// Initialize the database
initialize().then(() => {
  console.log('Database initialized successfully.');
}).catch(err => {
  console.error('Error initializing database:', err);
});

app.use(express.static('public')); // Serve static files from public folder

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (data) => {
    const { sessionId, username, message } = JSON.parse(data);
    const timestamp = new Date();

    try {
      await addMessage(sessionId, username, message);
      const broadcastMessage = JSON.stringify({ username, message, timestamp });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastMessage);
        }
      });

      // Fetch and print all messages from the database
      const messages = await getMessages(sessionId);
      console.log('Messages in database:', messages);
    } catch (err) {
      console.error('Error storing message:', err);
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