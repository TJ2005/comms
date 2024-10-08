const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  console.log('Connected to server');
};

socket.onmessage = (event) => {
  console.log(`Received message from server => ${event.data}`);
  document.getElementById('messages').innerHTML += `<p>${event.data}</p>`;
};

socket.onerror = (event) => {
  console.log('Error occurred');
  console.log(event);
};

socket.onclose = () => {
  console.log('Disconnected from server');
};

function sendMessage() {
  const msg = document.getElementById('input');
  const message = msg.value.trim();
  if (message !== '') {
    socket.send(message);
    msg.value = '';
  }
}

const input = document.getElementById('input');

setTimeout(function() {
  const input = document.getElementById('input');
  input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
      console.log('Message sent!');
    }
  });
}, 80);