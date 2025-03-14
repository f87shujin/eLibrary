const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000; // Change the port if needed

app.use(bodyParser.json());

app.post('/api/librarian', (req, res) => {
    const userMessage = req.body.message;

    // Command to run the Ollama model
    const command = `ollama run Toshokan "${userMessage}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return res.status(500).json({ error: 'Error processing request' });
        }
        res.json({ response: stdout.trim() }); // Send back the model's response
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 