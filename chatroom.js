let socket;
const username = localStorage.getItem('username');

window.addEventListener('DOMContentLoaded', () => {
    const sessionId = localStorage.getItem('sessionId');
    const userId = localStorage.getItem('userId');
    const sessionCode = localStorage.getItem('sessionCode');
    codeElement=document.getElementById('code');
    console.log(codeElement);
    codeElement.textContent = sessionCode;


    if (!sessionId || !username) {
        window.location.href = 'index.html';
        return;
    }
    socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
        getMessages(sessionId, 100);
    });

    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);

        switch (message.action) {
            case 'getMessagesResponse':
                displayMessages(message.data);
                break;

            case 'broadcastMessage':
                displayMessage(message);
                break;

            default:
                console.error('Unknown message action:', message.action);
        }
    });

    document.getElementById('input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage(sessionId, userId, event.target.value);
            event.target.value = '';
        }
    });
});

function sendMessage(sessionId, userId, content) {
    const message = {
        action: 'sendMessage',
        userId,
        sessionId,
        message: content,
        username
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('Socket is not open');
    }
}

function getMessages(sessionId, limit) {
    const message = {
        action: 'getMessages',
        sessionId,
        limit
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('Socket is not open');
    }
}

function displayMessages(messages) {
    messages.reverse().forEach(displayMessage);
}

function displayMessage(msg) {
    const chat = document.getElementById('chat');
    const isMine = msg.username === username;
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add(isMine ? 'mine' : 'yours', 'messages');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'last');
    console.log(msg)
    messageDiv.textContent = msg.content || '[No content]';

    messageWrapper.appendChild(messageDiv);
    chat.appendChild(messageWrapper);
    chat.scrollTop = chat.scrollHeight;
    
}
