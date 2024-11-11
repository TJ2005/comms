const express = require('express');
const app = express();
const WebSocket = require('ws');
const db = require('./database'); // Import functions from database.js
app.use(express.json());

// Initialize the database schema on server start
db.initialize();

// WebSocket setup
const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket Server running on port 8080");


// When the client connects ( Thus the on connection)
wss.on('connection', (ws) => {
  // Logging it in console
    console.log('Client connected');
    // Its a message and has some data attached to it
    ws.on('message', async (data) => {
      // Parse that data intto JSON using json.parse it just works idk how
        const { action, ...params } = JSON.parse(data);
        // check the request type in the data
        try {
            let response;
            switch (action) {
                case 'logOn':
                    // Join or create session based on username and session code
                    console.log(params.username,params.sessionCode);
                    const sessionId = await db.joinOrCreateSession(params.username, params.sessionCode);
                    response = { sessionId };
                    console.log(sessionId);
                    break;

                case 'sendMessage':
                    // Send a message in a session
                    const userId = await db.newUser(params.username); // Ensure the user exists
                    await db.sendMessage(userId, params.sessionId, params.message, null, 'text');
                    response = { status: 'Message sent' };
                    break;

                case 'getMessages':
                    // Retrieve messages from a session
                    const messages = await db.getMessage(params.sessionId, params.limit || 10);
                    response = { messages };
                    break;

                default:
                    response = { error: 'Unknown action type' };
            }

            ws.send(JSON.stringify({ action, status: 'success', data: response }));
            console.log(`Action "${action}" processed successfully.`);

            // Broadcast new messages to all clients
            if (action === 'sendMessage') {
                const broadcastMessage = JSON.stringify({
                    username: params.username,
                    message: params.message,
                    timestamp: new Date(),
                });
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(broadcastMessage);
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
    console.log(`Server running on port ${PORT}`);
});
