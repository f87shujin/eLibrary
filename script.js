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

let API_BASE_URL = "https://107.159.209.164:11434"; // Use HTTPS

async function checkAPIAvailability() {
    try {
        // Try local API first with HTTPS
        const localResponse = await fetch('https://127.0.0.1:11434/api/chat', {
            method: 'HEAD',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            // Add this to accept self-signed certificates
            rejectUnauthorized: false
        });
        
        if (localResponse.ok) {
            API_BASE_URL = "https://127.0.0.1:11434";
            console.log("Using local API:", API_BASE_URL);
            return;
        }
    } catch (error) {
        console.log("Local API not available, trying remote API...");
    }

    try {
        // Try remote API with HTTPS
        const remoteResponse = await fetch('https://107.159.209.164:11434/api/chat', {
            method: 'HEAD',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            // Add this to accept self-signed certificates
            rejectUnauthorized: false
        });
        
        if (remoteResponse.ok) {
            API_BASE_URL = "https://107.159.209.164:11434";
            console.log("Using remote API:", API_BASE_URL);
        } else {
            console.error("Remote API not responding correctly");
        }
    } catch (error) {
        console.error("Error checking remote API:", error);
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
            mode: 'cors', // Keep CORS mode
            body: JSON.stringify({
                model: "Toshokan",
                messages: [
                    { 
                        role: "user", 
                        content: message 
                    }
                ]
            }),
        });

        loadingDiv.remove();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        // Handle streaming response
        const reader = response.body.getReader();
        let aiResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            try {
                const jsonResponse = JSON.parse(chunk);
                if (jsonResponse.response) {
                    aiResponse += jsonResponse.response;
                    // Update the message in real-time
                    updateLastAIMessage(aiResponse);
                }
            } catch (e) {
                console.error('Error parsing chunk:', e);
            }
        }

        if (!aiResponse) {
            throw new Error('No response received from AI');
        }

    } catch (error) {
        loadingDiv.remove();
        console.error('API Error:', error);
        showError(`Failed to connect to the API. Error: ${error.message}\nAPI URL: ${API_BASE_URL}`);
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

// Add this function to help with debugging
async function testAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            mode: 'cors',
            body: JSON.stringify({
                model: "Toshokan",
                messages: [
                    { 
                        role: "user", 
                        content: "Test message" 
                    }
                ]
            }),
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Raw response:', text);
        
        try {
            const json = JSON.parse(text);
            console.log('Parsed response:', json);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Add this new function to update the AI message in real-time
function updateLastAIMessage(content) {
    const chatBox = document.getElementById('chat-box');
    let lastAIMessage = chatBox.querySelector('.ai-message:last-child');
    
    if (!lastAIMessage) {
        lastAIMessage = document.createElement('div');
        lastAIMessage.className = 'ai-message';
        lastAIMessage.innerHTML = '<p></p>';
        chatBox.appendChild(lastAIMessage);
    }
    
    lastAIMessage.querySelector('p').textContent = content;
    chatBox.scrollTop = chatBox.scrollHeight;
}
