// Debug server to test basic functionality
import dotenv from 'dotenv';
import express from 'express';

console.log('🔍 Starting debug server...');

// Load environment variables
dotenv.config();

console.log('✅ Environment loaded');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

console.log(`📋 Configuration: ${HOST}:${PORT}`);

// Basic middleware
app.use(express.json());

console.log('✅ Basic middleware configured');

// Simple health check
app.get('/api/health', (req, res) => {
    console.log('🏥 Health check requested');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Debug server is running'
    });
});

console.log('✅ Routes configured');

// Start server
try {
    const server = app.listen(PORT, HOST, () => {
        console.log(`🚀 Debug server running on ${HOST}:${PORT}`);
        console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
    });
    
    server.on('error', (err) => {
        console.error('❌ Server error:', err);
    });
    
} catch (error) {
    console.error('❌ Failed to start server:', error);
}

console.log('✅ Server startup initiated');
