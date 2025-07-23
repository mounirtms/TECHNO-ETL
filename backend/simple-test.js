/**
 * Ultra simple test server
 */
import express from 'express';

const app = express();
const PORT = 5000;

app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ status: 'ok', message: 'Simple test working' });
});

app.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
});

console.log('Starting simple server...');
