document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Add function to fetch books with debug logging
    async function fetchBooks() {
        console.log('Attempting to fetch books...');
        try {
            const response = await fetch('https://elibrary-1rh1.onrender.com/api/books');
            console.log('API Response:', response);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch books: ${response.status}`);
            }
            
            const books = await response.json();
            console.log('Fetched books:', books);
            return books;
        } catch (error) {
            console.error('Error fetching books:', error);
            return null;
        }
    }

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
            // First fetch books
            console.log('Fetching books for message context...');
            const books = await fetchBooks();
            
            // Debug log for books data
            console.log('Books data for context:', books);
            
            // Prepare context with books information
            let bookContext = '';
            if (books && books.length > 0) {
                bookContext = 'Available books:\n' + books.map(book => 
                    `- ${book.name} (Price: $${book.price}) - ${book.description}`
                ).join('\n');
                console.log('Created book context:', bookContext);
            } else {
                console.log('No books available or failed to fetch books');
            }

            // Send to AI with books context
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'toshokan',
                    prompt: `Context about our library books: ${bookContext}\n\nUser question: ${message}`,
                    stream: false
                })
            });

            const data = await res.json();
            updateLastAIMessage(data.response.trim());
        } catch (err) {
            console.error('Error in sendMessage:', err);
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

    // Initial greeting with book information
    async function initialize() {
        console.log('Initializing chatbot...');
        try {
            const books = await fetchBooks();
            console.log('Initial books fetch:', books);
            
            if (books && books.length > 0) {
                const greeting = "Hello! I'm your library assistant. I can help you find books and answer questions about our collection. Here are some of our available books:\n\n" +
                    books.slice(0, 5).map(book => `- ${book.name} ($${book.price})`).join('\n');
                appendMessage('ai', greeting);
            } else {
                appendMessage('ai', "Hello! I'm your library assistant. How can I help you today?");
            }
        } catch (error) {
            console.error('Error in initialize:', error);
            appendMessage('ai', "Hello! I'm your library assistant. How can I help you today?");
        }
    }

    // Call initialize and log when it's done
    initialize().then(() => {
        console.log('Initialization complete');
    });
});
