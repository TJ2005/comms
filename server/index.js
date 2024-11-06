console.log("we are in");

function handleSubmit(event) {
    // Prevent the form from submitting the default way
    event.preventDefault();

    // Access form data
    let username = document.getElementById('username').value;
    let code = document.querySelector('.enCode input').value;

    console.log("Username input:", username);
    console.log("Code input:", code);

    // Generate a random code if not provided
    if (!code) {
        code = Math.random().toString(36).substring(2, 10);
        console.log("Generated code:", code);
    }

    // If no username is provided, fetch a random one
    if (!username) {
        fetchRandomUsernames().then(fetchedUsername => {
            username = fetchedUsername;
            console.log("Fetched Username:", username);
            connectToWebSocket(username, code); // Connect after fetching username
        });
    } else {
        connectToWebSocket(username, code); // Connect directly if username is provided
    }
}

// Establish WebSocket connection and send data when ready
function connectToWebSocket(username, code) {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        console.log('Socket is open.');

        const sessionData = {
            event: 'joinSession',
            sessionId: code,
            username: username
        };

        socket.send(JSON.stringify(sessionData));
        console.log("Data sent to server:", sessionData);
    };

    socket.onerror = () => {
        console.error('Socket connection error.');
    };
}

// Fetches a random username from the API
async function fetchRandomUsernames() {
    try {
        const response = await fetch('https://usernameapiv1.vercel.app/api/random-usernames');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const username = data.usernames[0]; // Access the first username in the array

        console.log("Fetched username from API:", username);
        return username;
    } catch (error) {
        console.error('Error fetching the random usernames:', error);
        return "GuestUser"; // Fallback username if fetch fails
    }
}
