document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('user', message);
        userInput.value = '';
        appendMessage('ai', 'Thinking...');

        try {
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'toshokan',
                    prompt: message,
                    stream: false
                })
            });

            const data = await res.json();
            updateLastAIMessage(data.response.trim());
        } catch (err) {
            updateLastAIMessage('Error: ' + err.message);
        }
    }

    function appendMessage(type, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `${type}-message`;
        msgDiv.innerHTML = `<p>${content}</p>`;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function updateLastAIMessage(content) {
        const lastAI = chatBox.querySelector('.ai-message:last-child p');
        if (lastAI) lastAI.textContent = content;
    }
});
