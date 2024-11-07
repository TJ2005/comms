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
                addUserToSession(randomUsername, codeField);
            })
            .catch(error => {
                console.error('Error fetching random username:', error);
            });
    } else {
        addUserToSession(usernameField, codeField);
    }
});

// Function to perform the fetch request and add user to session
function addUserToSession(username, code) {
    fetch('http://localhost:3000/api/add-user-to-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            code: code
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add user to session');
        }
        console.log('User added to session successfully');

        // Store session information in local storage
        localStorage.setItem('sessionCode', code);
        localStorage.setItem('username', username);

        // Redirect to chatroom.html
        window.location.href = 'chatroom.html';
    })
    .catch(error => {
        console.error('Error adding user to session:', error);
    });
}

// Session Handling
const existingToken = localStorage.getItem('sessionToken');

if (existingToken) {
    console.log("Restoring existing session with token:", existingToken);
    joinSession(existingToken);
} else {
    function startNewSession(username, code) {
        fetch('/api/start-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, code }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.sessionToken) {
                localStorage.setItem('sessionToken', data.sessionToken);
                console.log("Session token stored successfully:", data.sessionToken);
                joinSession(data.sessionToken);
            }
        })
        .catch(error => {
            console.error('Error starting new session:', error.message);
        });
    }
}

// Define joinSession function
function joinSession(sessionToken) {
    const sessionCode = localStorage.getItem('sessionCode');  // Retrieve session code if needed
    const message = JSON.stringify({
        action: 'joinSession',
        sessionCode: sessionCode,
        sessionToken: sessionToken
    });
    socket.send(message);
}
