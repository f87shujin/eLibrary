const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS
app.use(cors());

// Proxy configuration
app.use('/api', createProxyMiddleware({
    target: 'http://107.159.209.164:11434',
    changeOrigin: true,
    secure: false
}));

// SSL certificate configuration
const sslOptions = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

// Create HTTPS server
https.createServer(sslOptions, app).listen(443, () => {
    console.log('Proxy server running on port 443');
}); 