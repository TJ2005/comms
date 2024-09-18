document.addEventListener('DOMContentLoaded', function () {
    let currentParent = 'logo-container'; // Define currentParent globally

    const userPageElement = document.getElementById('user-page');


    // Get the element to animate
    const element = document.getElementById('js-typing');

    // Extract the text content of the element
    const text = element.textContent;

    // Clear the text content initially
    element.textContent = '';

    // Use a typing speed defined in a data attribute
    const typingSpeed = 80;

    // Append characters to the element one by one, simulating typing
    let index = 0;
    function typeNextCharacter() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeNextCharacter, typingSpeed);
        } else {
            element.textContent = text;
            triggerAnimation();
            userPageElement.classList.remove('hide');
            userPageElement.classList.add('show-animation');
        }
    }
    function triggerAnimation() {
        const element = document.getElementById('js-typing');
        const parent1 = document.getElementById('logo-container');
        const parent2 = document.getElementById('navbar-logo');
        const targetParent = parent2;
        const rect = element.getBoundingClientRect();
        const clone = element.cloneNode(true);
        document.body.appendChild(clone);

        clone.style.position = 'absolute';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;

        element.style.opacity = 0;
        targetParent.appendChild(element);

        const newRect = element.getBoundingClientRect();
        requestAnimationFrame(() => {
            clone.style.transform = `translate(${newRect.left - rect.left}px, ${newRect.top - rect.top}px)`;
        });

        clone.addEventListener('transitionend', () => {
            clone.remove();
            element.style.opacity = 1;
            currentParent = currentParent === 'logo-container' ? 'navbar' : 'logo-container';
        });
    }

    typeNextCharacter();
});

