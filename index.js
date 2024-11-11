// Establish WebSocket connection to the server
const socket = new WebSocket('ws://localhost:8080');  // Adjust the URL if needed

// Log WebSocket connection status
socket.addEventListener('open', () => {
  console.log('Client connected to WebSocket server');
});
socket.addEventListener('close', () => {
  console.log('Client disconnected from WebSocket server');
});
socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});

// Select the button with class "go" and add an event listener
document.querySelector('.go').addEventListener('click', function(event) {
    event.preventDefault();

    const usernameField = document.getElementById('username').value.trim();
    let codeField = document.querySelector('.enCode input').value.trim();

    if (!codeField) {
        codeField = Math.random().toString(36).substring(2, 10);
        console.log("Code generated successfully:", codeField);
    }

    if (!usernameField) {
        fetch('https://usernameapiv1.vercel.app/api/random-usernames')
            .then(response => response.json())
            .then(data => {
                const randomUsername = data[0];
                console.log("Fetched random username:", randomUsername);
                logon(randomUsername, codeField);
            })
            .catch(error => {
                console.error('Error fetching random username:', error);
            });
    } else {
        logon(usernameField, codeField);
    }
});




// Define joinSession function
function logon(username,code) {
    const message = JSON.stringify({
        action: 'logOn',
        username: username,
        sessionCode: code
    });
    socket.send(message);
}
