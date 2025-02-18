document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    document.getElementById('user-input').value = '';

    // Display loading animation
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading';
    loadingMessage.innerText = 'Loading...';
    chatBox.appendChild(loadingMessage);

    // Call the API with proper error handling
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userInput }]
            }],
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE"
                }
            ]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Remove loading animation
        chatBox.removeChild(loadingMessage);

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response format from API');
        }

        // Extract and display the AI response
        const aiResponse = data.candidates[0].content.parts[0].text;
        chatBox.innerHTML += `<div class="ai-message">${aiResponse}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
        chatBox.removeChild(loadingMessage);
        chatBox.innerHTML += `<div class="error-message">Error: ${error.message}</div>`;
    });
}
