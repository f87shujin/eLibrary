// Your API key should be stored securely
const API_KEY = 'AIzaSyC7Q7UFYHlIdmt1Vl1tJn-lsOp7bEgmRng'; // Replace with your actual API key

document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');

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

    // Add user message to chat
    chatBox.innerHTML += `
        <div class="user-message">
            <p>${message}</p>
        </div>
    `;

    // Clear input
    userInput.value = '';

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'AI is thinking...';
    chatBox.appendChild(loadingDiv);

    // Auto scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove loading indicator
        loadingDiv.remove();

        // Check if we have a valid response
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            chatBox.innerHTML += `
                <div class="ai-message">
                    <p>${aiResponse}</p>
                </div>
            `;
        } else {
            throw new Error('Invalid response format from API');
        }

        // Auto scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error('Error details:', error);
        
        // Remove loading indicator
        loadingDiv.remove();

        // Show error message in chat
        chatBox.innerHTML += `
            <div class="error-message">
                <p>Sorry, I encountered an error. Please try again later.</p>
            </div>
        `;
        
        // Auto scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}
