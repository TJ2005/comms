document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    if (typeof typer === 'undefined' || typer.isFinished()) {
        console.log('typer.js is finished or undefined');
        triggerAnimation();
    } else {
        console.log('Waiting for typer.js to finish');
        typer.onFinish(function() {
            console.log('typer.js finished');
            triggerAnimation();
        });
    }
});

function triggerAnimation() {
    console.log('Triggering animation');
    var logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        console.log('Element found, adding class');
        logoContainer.classList.add('move-to-top-left');
    } else {
        console.log('Element not found');
    }
}