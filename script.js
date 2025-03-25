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

let API_BASE_URL = "http://107.159.209.164:11434"; // Force HTTP
let SERVER_URL = "http://localhost:10000";

async function checkAPIAvailability() {
    try {
        // Try local API first
        const localResponse = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'HEAD',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (localResponse.ok) {
            API_BASE_URL = "http://127.0.0.1:11434";
            console.log("Using local API:", API_BASE_URL);
            return;
        }
    } catch (error) {
        console.log("Local API not available, trying remote API...");
    }

    try {
        // Try remote API
        const remoteResponse = await fetch('http://107.159.209.164:11434/api/chat', {
            method: 'HEAD',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (remoteResponse.ok) {
            API_BASE_URL = "http://107.159.209.164:11434";
            console.log("Using remote API:", API_BASE_URL);
        } else {
            console.error("Remote API not responding correctly");
        }
    } catch (error) {
        console.error("Error checking remote API:", error);
    }
}

// Update the fetchBooks function
async function fetchBooks() {
    try {
        console.log('Fetching books from:', `${SERVER_URL}/api/books`);
        const response = await fetch(`${SERVER_URL}/api/books`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors' // Enable CORS
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const books = await response.json();
        console.log('Fetched books:', books); // Debug log
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        // Return some default books if server is not available
        return [
            { 
                name: "Unable to fetch books from server", 
                price: 0, 
                description: "Please make sure the server is running on port 10000" 
            }
        ];
    }
}

// Modify the sendMessage function to include books context
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';

    const loadingDiv = showLoading();

    try {
        // Fetch books first
        const books = await fetchBooks();
        let contextPrompt;

        if (books.length === 0 || (books.length === 1 && books[0].name === "Unable to fetch books from server")) {
            contextPrompt = `I apologize, but I'm currently unable to access the library's book database. I'll try to help you with general information. User question: ${message}`;
        } else {
            const booksContext = books.map(book => 
                `"${book.name}" (Price: $${book.price}) - ${book.description || 'No description available'}`
            ).join('\n');
            contextPrompt = `Here are the books available in our library:\n${booksContext}\n\nUser question: ${message}`;
        }

        console.log('Sending context:', contextPrompt);

        const apiUrl = API_BASE_URL.replace('https://', 'http://');
        const response = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({
                model: "toshokan",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful library assistant. You have access to information about our library's books and can help users find books, understand their content, and make recommendations."
                    },
                    { 
                        role: "user", 
                        content: contextPrompt 
                    }
                ],
                stream: true
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        // Handle streaming response
        const reader = response.body.getReader();
        let aiResponse = '';
        let hasReceivedResponse = false;

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('Stream complete');
                break;
            }

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                try {
                    const jsonResponse = JSON.parse(line);
                    if (jsonResponse.message?.content) {
                        hasReceivedResponse = true;
                        aiResponse += jsonResponse.message.content;
                        updateLastAIMessage(aiResponse);
                    }
                } catch (e) {
                    console.error('Error parsing chunk:', e, 'Raw chunk:', line);
                }
            }
        }

        loadingDiv.remove();

        if (!hasReceivedResponse) {
            throw new Error('No response content received from AI');
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

// Update the updateLastAIMessage function to handle HTML content
function updateLastAIMessage(content) {
    const chatBox = document.getElementById('chat-box');
    let lastAIMessage = chatBox.querySelector('.ai-message:last-child');
    
    if (!lastAIMessage) {
        lastAIMessage = document.createElement('div');
        lastAIMessage.className = 'ai-message';
        lastAIMessage.innerHTML = '<p></p>';
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
