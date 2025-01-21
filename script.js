document.getElementById('send-button').addEventListener('click', sendMessage);

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

    // Call the API
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyC7Q7UFYHlIdmt1Vl1tJn-lsOp7bEgmRng', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userInput }]
            }]
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading animation
        chatBox.removeChild(loadingMessage);

        // Display the response
        const aiResponse = data.contents[0].parts[0].text;
        chatBox.innerHTML += `<div class="ai-message">${aiResponse}</div>`;
    })
    .catch(error => {
        console.error('Error:', error);
        chatBox.removeChild(loadingMessage);
        chatBox.innerHTML += `<div class="error-message">Error fetching response</div>`;
    });
}
