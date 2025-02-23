let cegidDbPool;



// Route to test CEGID DB connection
app.post('/api/cegid/test-connection', async (req, res) => {
    console.log(req.body);
    const dbConfig = req.body; // Get CEGID DB config from frontend
    try {
        cegidDbPool = await sql.connect(dbConfig);
        console.log('Connected to CEGID DB successfully');
        res.status(200).json({ message: 'Connection successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Start the server


export default cegidDbPool;