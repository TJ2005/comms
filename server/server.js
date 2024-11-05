const express = require('express');
const app = express();
const WebSocket = require('ws');
const mysql = require('mysql2');

// Database connection
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "Messages"
};

const con = mysql.createConnection(dbConfig);

con.connect(function(err) {
    if (err) {
        console.error('Error connecting:', err);
        return;
    }
    console.log("Connected!");
    createTable();
});

const createTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS Messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            Username VARCHAR(255),
            Message TEXT,
            Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    con.query(createTableQuery, function(err, result) {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }
        console.log("Table 'Messages' created or already exists");
    });
};

const storeMessage = (sessionId, username, message, timestamp) => {
    const insertQuery = `INSERT INTO Messages (SessionID, Username, Message, Timestamp) VALUES (?, ?, ?, ?)`;
    con.query(insertQuery, [sessionId, username, message, timestamp], function(err, result) {
        if (err) {
            console.error('Error storing message:', err);
            return;
        }
        console.log('Message stored in database');
    });
};

app.use(express.static('public')); // Serve static files from public folder

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
        const { sessionId, username, message } = JSON.parse(data);
        const timestamp = new Date();

        storeMessage(sessionId, username, message, timestamp);

        const broadcastMessage = JSON.stringify({ username, message, timestamp });
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastMessage);
            }
        });
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
