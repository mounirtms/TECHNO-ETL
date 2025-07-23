console.log('Node.js is working!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Test if we can create a simple HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        message: 'Test server working!',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
    }));
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/test`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
