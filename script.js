// Remove unused API key
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    
    // Add a check for local API availability on load
    checkLibrarianAPI();
    
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Function to check if the librarian API is available
async function checkLibrarianAPI() {
    try {
        const response = await fetch('http://127.0.0.1:3000/health');
        const data = await response.json();
        if (data.status === 'ok') {
            console.log('Librarian API is available:', data.ollama_version);
        }
    } catch (error) {
        console.error('Librarian API is not available:', error);
        showError('Please make sure the Librarian API is running locally on your computer (http://127.0.0.1:3000)');
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const message = userInput.value.trim();

    if (!message) return;

    try {
        appendMessage('user', message);
        userInput.value = '';

        const loadingDiv = showLoading();

        // Try to connect to local API
        try {
            const response = await fetch('http://127.0.0.1:3000/api/librarian', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            loadingDiv.remove();

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.response || 'No response received';
            appendMessage('ai', aiResponse);

        } catch (apiError) {
            loadingDiv.remove();
            console.error('API Error:', apiError);
            showError(`
                Unable to connect to the Librarian API. Please ensure:
                1. The librarian server is running on your computer
                2. You're running 'node librarian.js' in your terminal
                3. Your computer's port 3000 is available
            `);
        }

    } catch (error) {
        console.error('Chat Error:', error);
        showError('An unexpected error occurred. Please check the console for details.');
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
