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
        showError(`
            Please follow these steps to connect to the local API:
            1. Make sure the Librarian API is running (node librarian.js)
            2. In Opera, click the shield icon in the address bar
            3. Select "Site Settings"
            4. Find "Insecure content" and set it to "Allow"
            5. Refresh the page
            
            If you still see this error, check if the API is running at http://127.0.0.1:3000
        `);
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

        try {
            const response = await fetch('http://127.0.0.1:3000/api/librarian', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                // Add these settings for Opera
                mode: 'cors',
                cache: 'no-cache',
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
                Unable to connect to the Librarian API. For Opera users:
                1. Click the shield icon in the address bar
                2. Select "Site Settings"
                3. Find "Insecure content" and set it to "Allow"
                4. Refresh the page
                
                Also ensure:
                - The librarian server is running on your computer
                - You're running 'node librarian.js' in your terminal
                - Port 3000 is available
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
