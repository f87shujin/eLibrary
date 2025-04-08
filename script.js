document.addEventListener('DOMContentLoaded', function () {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');

    // Set API_BASE_URL based on the server's IP address
    const API_BASE_URL = "http://198.16.179.173:11434"; // Replace with your server's IP address

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (!message) return; // Prevent sending empty messages

    appendMessage('user', message); // Display user message
    userInput.value = ''; // Clear input field
    showLoading(); // Show loading indicator

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: message }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        appendMessage('ai', data.response); // Display AI response
    } catch (error) {
        showError('Error: ' + error.message); // Show error message
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
}

function showError(message) {
    const chatBox = document.getElementById('chat-box');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<p>${message}</p>`;
    chatBox.appendChild(errorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Update the updateLastAIMessage function to handle HTML content
function updateLastAIMessage(content) {
    const chatBox = document.getElementById('chat-box');
    let lastAIMessage = chatBox.querySelector('.ai-message:last-child');
    
    if (!lastAIMessage) {
        lastAIMessage = document.createElement('div');
        lastAIMessage.innerHTML = '<p></p>';
        lastAIMessage.className = 'ai-message';
        chatBox.appendChild(lastAIMessage);
    }
    
    // Safely set the content
    const p = lastAIMessage.querySelector('p');
    p.textContent = content;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Add this function to help with debugging
function testAPI() {
    console.log('Testing API connection...');
    fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            model: "toshokan",
            messages: [{ role: "user", content: "Hello" }],
            stream: true
        })
    })
    .then(response => {
        console.log('Response:', response);
        return response.body.getReader();
    })
    .then(reader => {
        function push() {
            return reader.read().then(({done, value}) => {
                if (done) {
                    console.log('Stream complete');
                    return;
                }
                const chunk = new TextDecoder().decode(value);
                console.log('Chunk received:', chunk);
                return push();
            });
        }
        return push();
    })
    .catch(error => {
        console.error('Test failed:', error);
    });
}

loadHTML('header', 'http://localhost:8080/header.html');
loadHTML('footer', 'http://localhost:8080/footer.html');
