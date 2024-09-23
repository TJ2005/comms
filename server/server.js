const express = require('express');
const app = express();
const WebSocket = require('ws');

app.use(express.static('public')); // serve static files from public folder

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // handle incoming message from client
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    // broadcast message to all connected clients
    wss.clients.forEach((client) => {
      client.send(`Server: ${message}`);
    });
  });

  // handle errors
  ws.on('error', (error) => {
    console.log('Error occurred');
    console.log(error);
  });

  // handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  pw: String
});

const userModel = mongoose.model("users", userSchema);

app.get("/getUsers", (req, res) => {
  res.json(userModel.find({}).then(function(users) {
    res.json(users)
  })).catch(function(err) {
    console.log(err)
  });
});