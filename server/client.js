const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = (event) => {
  console.log(`Received message: ${event.data}`);
};

socket.onopen = () => {
  console.log('Connected to server');
  socket.send('Hello, server!');
};

// Send a file
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  socket.send({ type: 'file', file: file });
});