const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const HOST = '127.0.0.1';
const PORT = 3000;

// Basic middleware
app.use(cors());
app.use(bodyParser.json());

// Main endpoint for Toshokan
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Create a promise with timeout for Ollama execution
        const execPromise = new Promise((resolve, reject) => {
            const process = exec(`ollama run Toshokan "${userMessage}"`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });

            // 30 second timeout
            setTimeout(() => {
                process.kill();
                reject(new Error('Request timed out'));
            }, 30000);
        });

        const response = await execPromise;
        res.json({ response });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Error processing request',
            details: error.message 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    exec('ollama --version', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                status: 'error',
                message: 'Ollama not available'
            });
        }
        res.json({ status: 'ok' });
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
    console.log('Make sure Ollama is installed and running!');
}); 