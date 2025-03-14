// Store API key
const API_KEY = 'AIzaSyBmwLJ7A0GwAXpao_EdMhnNdkangS6MSwA'; // Replace with your actual API key

document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');

    // Remove unused API_KEY since we're using local Ollama
    
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const message = userInput.value.trim();

    if (!message) return;

    try {
        // Show user message
        appendMessage('user', message);
        userInput.value = '';

        // Show loading state
        const loadingDiv = showLoading();

        // Make API request to the local Ollama model
        const response = await fetch('http://127.0.0.1:3000/api/librarian', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        // Remove loading indicator
        loadingDiv.remove();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Show AI response - handle potential markdown formatting
        const aiResponse = data.response || 'No response received';
        appendMessage('ai', aiResponse);

    } catch (error) {
        console.error('Chat Error:', error);
        showError('Sorry, there was an error connecting to the librarian. Make sure the server is running on localhost:3000');
    }
}

function appendMessage(type, content) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.innerHTML = `<p>${content}</p>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoading() {
    const chatBox = document.getElementById('chat-box');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'AI is thinking...';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return loadingDiv;
}

function showError(message) {
    const chatBox = document.getElementById('chat-box');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<p>${message}</p>`;
    chatBox.appendChild(errorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
