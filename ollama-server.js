const { spawn } = require('child_process');
const express = require('express');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_PORT = 11434; // Default Ollama API port
const cors = require('cors');
app.use(cors());


// Configure Express
app.use(express.json());

// Basic status endpoint
app.get('/status', (req, res) => {
  res.json({ status: 'Ollama server is running' });
});

// Endpoint to test the model with human-readable output
app.post('/generate', (req, res) => {
  const prompt = req.body.prompt || 'Hello, how are you?';
  
  const options = {
    host: 'localhost',
    port: OLLAMA_PORT,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  // Set content type to plain text for readable response
  res.setHeader('Content-Type', 'text/plain');
  
  const ollamaReq = http.request(options, (ollamaRes) => {
    let fullText = '';
    
    ollamaRes.on('data', (chunk) => {
      try {
        const jsonChunk = JSON.parse(chunk.toString());
        if (jsonChunk.response) {
          // Append to the full text
          fullText += jsonChunk.response;
          
          // For streaming experience, send each piece as it comes
          // This is optional - you can comment this out if you only want the final result
          res.write(jsonChunk.response);
        }
      } catch (e) {
        console.error('Error parsing JSON chunk:', e);
      }
    });
    
    ollamaRes.on('end', () => {
      // If you commented out the streaming above, uncomment this to send the full text at the end
      // res.write(fullText);
      res.end();
    });
  });
  
  ollamaReq.on('error', (error) => {
    console.error('Error communicating with Ollama:', error);
    res.status(500).send('Failed to communicate with Ollama service');
  });
  
  // Send the request to Ollama
  ollamaReq.write(JSON.stringify({
    model: 'toshokan',
    prompt: prompt,
    stream: true
  }));
  
  ollamaReq.end();
});

// Add a non-streaming version that returns the complete response
app.post('/generate-complete', (req, res) => {
  const prompt = req.body.prompt || 'Hello, how are you?';
  
  const options = {
    host: 'localhost',
    port: OLLAMA_PORT,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  const ollamaReq = http.request(options, (ollamaRes) => {
    let fullText = '';
    
    ollamaRes.on('data', (chunk) => {
      try {
        const jsonChunk = JSON.parse(chunk.toString());
        if (jsonChunk.response) {
          fullText += jsonChunk.response;
        }
      } catch (e) {
        console.error('Error parsing JSON chunk:', e);
      }
    });
    
    ollamaRes.on('end', () => {
      res.setHeader('Content-Type', 'text/plain');
      res.send(fullText);
    });
  });
  
  ollamaReq.on('error', (error) => {
    console.error('Error communicating with Ollama:', error);
    res.status(500).send('Failed to communicate with Ollama service');
  });
  
  // Send the request to Ollama
  ollamaReq.write(JSON.stringify({
    model: 'toshokan',
    prompt: prompt,
    stream: true
  }));
  
  ollamaReq.end();
});

// Start Ollama process and wait for it to be ready
async function startOllama() {
  console.log('Starting Ollama with Toshokan model...');
  
  const ollama = spawn('ollama', ['run', 'toshokan']);
  
  ollama.stdout.on('data', (data) => {
    console.log(`Ollama output: ${data}`);
  });
  
  ollama.stderr.on('data', (data) => {
    console.error(`Ollama error: ${data}`);
  });
  
  ollama.on('close', (code) => {
    console.log(`Ollama process exited with code ${code}`);
    // Restart Ollama if it crashes
    if (code !== 0) {
      console.log('Attempting to restart Ollama...');
      setTimeout(startOllama, 5000);
    }
  });
  
  // Wait for Ollama to start up
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return ollama;
}

// Handle graceful shutdown
let ollamaProcess = null;
function shutdown() {
  console.log('Shutting down server...');
  if (ollamaProcess) {
    ollamaProcess.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
async function startServer() {
  app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    ollamaProcess = await startOllama();
    console.log('Ollama should now be ready');
  });
}

startServer(); 