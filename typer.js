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
            // Typing effect is complete
            setTimeout(clearTextContent, 500);
            // element.textContent = text;
            
            setTimeout(() => {
                userPageElement.classList.remove('hide');
                userPageElement.classList.add('show-animation');
            }, 1000);
            // WE AINT CALLING THIS triggerAnimation();  // Call the animation after typing effect is done
            // Lets instead just fade animate the comms out and fade in the user page

        }
    }
    // Function to clear the text content one by one
    function clearTextContent() {
            if (index > 0) {
                element.textContent = element.textContent.slice(0, -1);
                index--;
                setTimeout(clearTextContent, typingSpeed*0.38);
            } else {
                element.classList.add('hide');
                // Text clearing effect is complete
                // You can add any additional logic here if needed
            }
        }
        
    
        // Function to fade out the logo text and fade it in the navbar

    // Function to fade out the logo text and fade it in the navbar
    function triggerAnimation() {
        // Lets never call this function cuz it aint working rn.
        // Somebody branch this shit fix it and merge it back 
        const navbarLogo = document.getElementById('navbar-logo');

        // Clone the original element for animation
        const clone = element.cloneNode(true);
        document.body.appendChild(clone);

        // Set initial styles for the clone

        clone.style.left = `${element.getBoundingClientRect().left}px`;
        clone.style.top = `${element.getBoundingClientRect().top}px`;
        clone.style.width = `${element.getBoundingClientRect().width}px`;  // Retain the same width
        clone.style.height = `${element.getBoundingClientRect().height}px`;  // Retain the same height
        clone.style.transition = 'opacity 1s ease';
        clone.style.opacity = 1;

        // Hide the original element to avoid duplicate display during animation
        element.style.opacity = 0;

        // Fade out the clone
        setTimeout(() => {
            clone.style.opacity = 0;
        }, 100);

        // Listen for the end of the transition to clean up the clone and fade in the original element in the navbar
        clone.addEventListener('transitionend', () => {
            clone.remove();  // Remove the animated clone after the transition is complete
            element.style.opacity = 1;  // Show the original element again
            navbarLogo.appendChild(element); // Move the original element into the navbar
            element.style.transition = 'opacity 1s ease';
            element.style.opacity = 1;  // Fade in the original element in the navbar
        });
    }

    // Start typing effect
    typeNextCharacter();
});