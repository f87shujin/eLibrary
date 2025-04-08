document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    const API_URL = "http://localhost:11434/api/generate";

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const prompt = userInput.value.trim();
        if (!prompt) return;

        appendMessage('user', prompt);
        userInput.value = '';
        appendMessage('ai', 'Thinking...');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    model: 'toshokan',
                    prompt: prompt,
                    stream: false
                }) // no content-type header!
            });

            const data = await response.json();
            updateLastAIMessage(data.response.trim());
        } catch (err) {
            updateLastAIMessage('Error: ' + err.message);
        }
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = role === 'user' ? 'user-message' : 'ai-message';
        div.innerHTML = `<p>${text}</p>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function updateLastAIMessage(text) {
        const messages = chatBox.getElementsByClassName('ai-message');
        if (messages.length > 0) {
            messages[messages.length - 1].innerHTML = `<p>${text}</p>`;
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
