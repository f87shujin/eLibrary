const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
// Change this to only listen on localhost
const HOST = '127.0.0.1';
const PORT = process.env.PORT || 3000;

// Rate limiting - protect from abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Configure CORS for security
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',  // In production, specify your frontend domain
    methods: ['GET', 'POST']
}));

// Add basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.use(bodyParser.json());

// Function to fetch books from your main server
async function fetchBooks() {
    try {
        // Using your deployed server URL
        const response = await axios.get('https://elibrary-1rh1.onrender.com/api/books');
        return response.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

app.post('/api/librarian', async (req, res) => {
    const userMessage = req.body.message;
    
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Fetch books first
        const books = await fetchBooks();
        
        if (!books || books.length === 0) {
            console.warn('No books fetched from the library');
        }
        
        // Create a context message with the books data
        const booksContext = books.map(book => 
            `"${book.name}" (Price: $${book.price}) - ${book.description}`
        ).join('\n');

        // Prepare the full prompt with context
        const contextPrompt = `Here is our library catalog:\n${booksContext}\n\nUser question: ${userMessage}`;

        // Escape special characters in the prompt
        const escapedPrompt = contextPrompt.replace(/"/g, '\\"');

        // Run Ollama with the context
        exec(`ollama run Toshokan "${escapedPrompt}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Ollama:`, error);
                return res.status(500).json({ error: 'Error processing request with AI model' });
            }
            res.json({ response: stdout.trim() });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing request' });
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        exec('ollama --version', (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ 
                    status: 'error',
                    message: 'Ollama not available',
                    error: error.message
                });
            }
            res.json({ 
                status: 'ok',
                ollama_version: stdout.trim()
            });
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Change the listen call to bind to localhost only
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log('Make sure Ollama is installed and running!');
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
}); 