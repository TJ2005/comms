// This file exists to manage the connection between the Backend and Frontend
// We intercept form to prevent the default submission and handle the data ourselves

const {addUserToSession} = require('./database');



function handleSubmit(event) {
    // Prevent the form from submitting the default way
    event.preventDefault();

    // Access form data
    const username = document.getElementById('username').value;
    const code = document.querySelector('.enCode input').value;

    // Perform any action with the data (e.g., validation, AJAX request, etc.)
    console.log("Username:", username);
    console.log("Code:", code);

    // Checking Code
    if (!code) {
      // Generate a random code
        code=Math.random().toString(36).substring(2, 10);
        console.log("Code generated successfully");
    } 
    // Checking Username
    if (!username) {
      // Call the async function to fetch the random usernames
        username= fetchRandomUsernames();
    } 
    else {
        // Example of further processing (e.g., sending data via AJAX)
        console.log("Code submitted successfully");
        // Send the data to the server
        // INCOMPLETE
        
        // MAKE FUNCTION TO SEND DATA TO SERVER
    }
}
// Define an async function to fetch the random username
async function fetchRandomUsernames() {
    try {
      // Make the GET request to the API
      const response = await fetch('https://usernameapiv1.vercel.app/api/random-usernames');
      
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Parse the response as JSON
      const data = await response.json();
      
      // Store the response data in a variable
      const randomUsernames = data;
      
      // Log the usernames to the console
      console.log(randomUsernames);
  
      // You can use the randomUsernames variable for other logic as needed
      return randomUsernames;
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('Error fetching the random usernames:', error);
    }
  }
//console.log("fetchRandomUsernames() function:", fetchRandomUsernames());

async function addusers() {
  await initialize(); // Ensure the database is initialized

  try {
      const result = await addUserToSession(code, username);
      console.log('User  added to session:', result);
  } catch (error) {
      console.error('Error adding user to session:', error.message);
  }
}

addusers();