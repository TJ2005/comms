window.addEventListener('DOMContentLoaded', function() {
    // Get session information from localStorage
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');

    if (!sessionId || !username) {
        // If there's no session or username, redirect back to the login page
        window.location.href = 'index.html';
        return;
    }

    // You can now use the sessionId and username for anything you need in the chatroom
    console.log('Session ID:', sessionId);
    console.log('Username:', username);

    // Initialize the WebSocket connection to the chat server (if needed)
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
    });

    socket.addEventListener('message', (event) => {
        // Handle incoming messages (chat, updates, etc.)
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
    });

    // Send a message when the user interacts with the chatroom (optional)
    // socket.send(message);
});


                    // // Define the WebSocket connection (make sure to update the URL to your server)
                    // const socket = new WebSocket('ws://localhost:8080');

                    // // Add an event listener to the input for the "keydown" event
                    // document.getElementById('input').addEventListener('keydown', function(event) {
                    //     if (event.key === 'Enter') {
                    //         if (socket.readyState === WebSocket.OPEN) {
                    //             console.log('Connected to WebSocket server');
                                
                    //             // Example of sending a message to the server
                    //             const message = {
                    //                 sessionId: 1, // Replace with your actual session ID
                    //                 username: 'user1', // Replace with the actual username
                    //                 message: this.value // Send the message from input
                    //             };

                    //             socket.send(JSON.stringify(message));
                    //             this.value = ''; // Clear the input after sending
                    //         } else {
                    //             console.log('WebSocket is not open');
                    //         }
                    //     }
                    // });