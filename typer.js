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
    if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(typeNextCharacter, 100);
    } else {
        element.textContent = text; // Set the final text without the cursor
    }
}

// Start the typing animation
typeNextCharacter();

// Include a blinking cursor effect using a CSS class
element.classList.add('js-typing-cursor');