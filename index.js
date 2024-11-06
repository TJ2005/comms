// Establish WebSocket connection to the server
const socket = new WebSocket('ws://localhost:8080');  // Adjust the URL if needed

// Log when the client connects to the WebSocket
socket.addEventListener('open', () => {
  console.log('Client connected to WebSocket server');
});

// Log when the client disconnects from the WebSocket
socket.addEventListener('close', () => {
  console.log('Client disconnected from WebSocket server');
});

// Log WebSocket errors
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});
