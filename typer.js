document.addEventListener('DOMContentLoaded', function () {
    const userPageElement = document.getElementById('user-page');
    const element = document.getElementById('js-typing');
    const text = element.textContent;

    // Clear the text content initially for typing effect
    element.textContent = '';

    const typingSpeed = 80;
    let index = 0;

    // Function to simulate typing effect character by character
    function typeNextCharacter() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeNextCharacter, typingSpeed);
        } else {
            element.textContent = text;
            triggerAnimation();  // Call the animation after typing effect is done
            userPageElement.classList.remove('hide');
            userPageElement.classList.add('show-animation');
        }
    }

    // Function to animate the logo text from the center to the navbar
    function triggerAnimation() {
        const parent2 = document.getElementById('navbar-logo');

        // Get the original position of the `js-typing` element (centered logo)
        const rect = element.getBoundingClientRect();

        // Clone the original element for animation
        const clone = element.cloneNode(true);
        document.body.appendChild(clone);

        // --- Set the initial position of the clone at the current location of the logo
        clone.style.position = 'absolute';
        clone.style.left = `${rect.left}px`;  
        clone.style.top = `${rect.top}px`;    
        clone.style.width = `${rect.width}px`;  
        clone.style.height = `${rect.height}px`; 
        clone.style.transition = 'all 1s ease'; // Smooth transition for movement and scaling
        clone.style.transform = 'none'; // Reset any transforms initially

        // Hide the original element to avoid duplicate display during animation
        element.style.opacity = 0;

        // --- Use requestAnimationFrame to ensure browser renders the clone at its initial position
        requestAnimationFrame(() => {
            // --- Use offsetTop and offsetLeft for more accurate positioning
            const newRect = parent2.getBoundingClientRect();
            
            // Adjust the scaling factor to make the font size more reasonable
            clone.style.transform = `translate(${newRect.left - rect.left}px, ${newRect.top - rect.top}px) scale(0.8)`; // Scale adjusted
        });

        // Listen for the end of the transition to clean up the clone and restore the original element
        clone.addEventListener('transitionend', () => {
            clone.remove();  // Remove the animated clone after the transition is complete
            element.style.opacity = 1;  // Show the original element again
            parent2.appendChild(element); // --- Move the original element into the navbar
        });
    }

    // Start typing effect
    typeNextCharacter();
});
