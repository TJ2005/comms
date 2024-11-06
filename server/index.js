// This file exists to manage the connection between the Backend and Frontend
// We intercept the form to prevent the default submission and handle the data ourselves

const { addUserToSession } = require('./database');
const { Pool } = require('pg');

// Database connection setup
const con = new Pool({
    user: 'postgres',     // replace with your PostgreSQL username
    host: 'localhost',         // or your PostgreSQL server address
    database: 'comms',  // replace with your database name
    password: 'root',  // replace with your database password
    port: 5432,                // PostgreSQL's default port
});

const sessionId = 1; // Ensure this session ID exists

// Insert message into Messages table
async function storeMessage(username, message, timestamp) {
    const insertQuery = `INSERT INTO Messages (SessionID, Username, Message, Timestamp) VALUES ($1, $2, $3, $4)`;
    try {
        await con.query(insertQuery, [sessionId, username, message, timestamp]);
        console.log('Message stored in database');
    } catch (err) {
        console.error('Error storing message:', err);
    }
}

// Handle form submission
function handleSubmit(event) {
    // Prevent the form from submitting the default way
    event.preventDefault();

    // Access form data
    const usernameField = document.getElementById('username');
    const codeField = document.querySelector('.enCode input');
    
    let username = usernameField ? usernameField.value : ""; //check this later
    let code = codeField ? codeField.value : ""; //check this later

    // Perform any action with the data (e.g., validation)
    console.log("Username:", username);
    console.log("Code:", code);

    // Check if code is empty, and generate a new one if necessary
    if (!code) {
        code = Math.random().toString(36).substring(2, 10);
        console.log("Code generated successfully:", code);
    }

    // Check if username is empty and fetch a random one if necessary
    if (!username) {
        fetchRandomUsernames().then((fetchedUsername) => {
            username = fetchedUsername;
            console.log("Fetched random username:", username);

            // Call the function to add the user to session and store the message
            processUserAndMessage(username, code);
        });
    } else {
        // Process directly if username is available
        processUserAndMessage(username, code);
    }
}

// Fetch a random username from an external API
async function fetchRandomUsernames() {
    try {
        const response = await fetch('https://usernameapiv1.vercel.app/api/random-usernames');
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        console.log("Random usernames fetched:", data);
        
        // Return the first username from the fetched data
        return data[0];
    } catch (error) {
        console.error('Error fetching random usernames:', error);
        return "GuestUser";  // Fallback username in case of an error
    }
}

// Process the user and message: Add the user to session, then store the message
async function processUserAndMessage(username, code) {
    try {
        await addUserToSession(code, username); // Assuming this function handles session association
        console.log('User added to session successfully');

        // Store a sample message with current timestamp
        const message = "Hello, World!";
        const timestamp = new Date();
        await storeMessage(username, message, timestamp);
    } catch (error) {
        console.error('Error processing user and message:', error.message);
    }
}

// Attach handleSubmit function to form submission
document.getElementById('yourFormId').addEventListener('submit', handleSubmit);
