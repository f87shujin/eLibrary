document.addEventListener('DOMContentLoaded', function () {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');

    // Auto-detect if using localhost or public API
    checkAPIAvailability();

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

let API_BASE_URL = "http://107.159.209.164:11434"; // Default to public API

async function checkAPIAvailability() {
    try {
        // Check if local API is available
        const response = await fetch('http://127.0.0.1:11434/api/chat');
        if (response.ok) {
            API_BASE_URL = "http://127.0.0.1:11434"; // Switch to local API if available
            console.log("Using local API:", API_BASE_URL);
        } else {
            console.log("Using public API:", API_BASE_URL);
        }
    } catch (error) {
        console.log("Using public API:", API_BASE_URL);
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';

    const loadingDiv = showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "Toshokan",
                messages: [{ role: "user", content: message }],
            }),
        });

        loadingDiv.remove();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.message || "No response received.";
        appendMessage('ai', aiResponse);
    } catch (error) {
        loadingDiv.remove();
        console.error('API Error:', error);
        showError(`Failed to connect to the API. Please ensure:
        - The API is running at ${API_BASE_URL}
        - Your internet connection is stable`);
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
