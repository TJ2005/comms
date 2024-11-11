let socket; // Define socket in the global scope

window.addEventListener('DOMContentLoaded', () => {
    // Get session information from localStorage
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    if (!sessionId || !username) {
        // If there's no session or username, redirect back to the login page
        window.location.href = 'index.html';
        return;
    }

    // You can now use the sessionId and username for anything you need in the chatroom
    console.log('Session ID:', sessionId);
    console.log('Username:', username);
    console.log('User ID:', userId);

    // Initialize the WebSocket connection to the chat server
    socket = new WebSocket('ws://localhost:8080'); // Initialize socket here

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
        // Request messages once the connection is open
        console.log(getMessages(sessionId, 100));
    });

    // Event listener for incoming messages
    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        // Add new message parser here for frontend
    });
    
    const inputField = document.getElementById('input');

    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            // Enter key was pressed
            const messageToBeSent = inputField.value;
            console.log('Message:', messageToBeSent);
            sendMessage(sessionId, userId, messageToBeSent);
            // Clear the input field after pressing Enter
            inputField.value = '';
        }
    });
});

const sendMessage = (sessionId, userId, content,username) => { // Rename 'message' parameter to 'content'
    const message = JSON.stringify({
        action: 'sendMessage',
        userId: userId,
        sessionId: sessionId,
        content: content, // Use 'content' instead of 'message'
        username: username
    });

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.error('Socket is not open');
    }
};

const getMessages = (sessionId, limit) => {
    const message = JSON.stringify({
        action: 'getMessages',
        sessionId: sessionId,
        limit: limit
    });

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.error('Socket is not open');
    }

    // Handle response when received
    socket.addEventListener('message', (event) => {
        const response = JSON.parse(event.data);
        if (response.status === 'success') {
            const messages = response.data.messages;
            console.log('Messages received:', messages);
        } else {
            console.error('Error getting messages:', response.error);
        }
    });
};
