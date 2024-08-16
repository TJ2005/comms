// Get the element to animate
const element = document.getElementById('js-typing');

// Extract the text content of the element
const text = element.textContent;

// Clear the text content initially
element.textContent = '';

// Use a typing speed defined in a data attribute
const typingSpeed = parseInt(element.getAttribute('data-typing-speed'));

// Append characters to the element one by one, simulating typing
let index = 0;
function typeNextCharacter() {
    // Check if there are more characters to type
    if (index < text.length) {
        // Append the next character
        element.textContent += text.charAt(index);
        // Increment the index
        index++;
        // Schedule the next character
        setTimeout(typeNextCharacter, 100);
        // change this value if u want to change the speed of typing
    } else {
        element.textContent = text;
    }
}

// Start the typing animation
typeNextCharacter();

// Include a blinking cursor effect using a CSS class
element.classList.add('js-typing-cursor');

/*the current state of this project is i have made the loading animation for startup
now i want to prpoceed and i need ur guidance

step 0: while the animation is playing the other page content should be loaded.
step 1: Play animation until Type next character is completed.
step 2: if after completion the page is not loaded for the client then the animation stays there until its loaded.
step 4: after page loads the page changes from this to the landing page which i will be making */