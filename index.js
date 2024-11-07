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

fetch('http://127.0.0.1:3000/api/add-user-to-session', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
  },
  body: JSON.stringify({
      username: 'exampleUser',
      code: 'exampleCode'
  })
});

// Handle button click for the "go" button
document.querySelector('.go').addEventListener('click', function(event) {
    // Prevent the form from submitting the default way
    event.preventDefault();

    // Access form data
    const usernameField = document.getElementById('username');
    const codeField = document.querySelector('.enCode input');
    
    let username = usernameField ? usernameField.value.trim() : ""; 
    let code = codeField ? codeField.value.trim() : ""; 
    
    // Check if code is empty, and generate a new one if necessary
    if (!code) {
      code = Math.random().toString(36).substring(2, 10);
      console.log("Code generated successfully:", code);
    }

    // Check if username is empty and fetch a random one if necessary
    if (!username) {
        fetch('https://usernameapiv1.vercel.app/api/random-usernames')
            .then(response => response.json())
            .then(data => {
                username = data[0];
                console.log("Fetched random username:", username);

                // Call the function to add the user to session
                sendUserAndSessionData(username, code);
            });
    } else {
        sendUserAndSessionData(username, code);
    }
});

function sendUserAndSessionData(username, code) {
    // Send data to the server using fetch
    fetch('/api/add-user-to-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, code }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add user to session');
        }
        console.log('User added to session successfully');

        // Send WebSocket message to server
        const message = JSON.stringify({
            action: 'joinSession',
            username: username,
            sessionCode: code
        });
        socket.send(message);  // Send data to WebSocket server
    })
    .catch(error => {
        console.error('Error processing user and session data:', error.message);
    });
}
