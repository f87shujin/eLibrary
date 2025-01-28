document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

let chatHistory = [];

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    document.getElementById('user-input').value = '';

    // Add user input to chat history
    chatHistory.push({ role: 'user', text: userInput });

    // Display loading animation
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading';
    loadingMessage.innerText = 'Loading...';
    chatBox.appendChild(loadingMessage);

    // Prepare the chat history for the API
    const apiInput = chatHistory.map(entry => ({
        parts: [{ text: entry.text }]
    }));

    // Call the API
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyC7Q7UFYHlIdmt1Vl1tJn-lsOp7bEgmRng', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: apiInput
        })
    })
    .then(response => {
        console.log('Response:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Data:', data);
        // Remove loading animation
        chatBox.removeChild(loadingMessage);

        // Extract and display the AI response
        const aiResponse = data.candidates[0].content.parts[0].text;
        chatBox.innerHTML += `<div class="ai-message">${aiResponse}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

        // Add AI response to chat history
        chatHistory.push({ role: 'ai', text: aiResponse });
    })
    .catch(error => {
        console.error('Error:', error);
        chatBox.removeChild(loadingMessage);
        chatBox.innerHTML += `<div class="error-message">Error fetching response</div>`;
    });
}
