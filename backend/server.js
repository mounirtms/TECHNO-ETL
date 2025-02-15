const express = require('express');
const cron = require('node-cron');
const { createMdmPool, createCegidPool, getPool } = require('./database');

const app = express();

app.use(express.json()); // Enable parsing JSON request bodies

 
// Connection endpoints
app.post('/api/mdm/connect', async (req, res) => {
    const dbConfig = req.body;
    try {
        await createMdmPool(dbConfig); // Call createMdmPool with config
        res.json({ message: 'MDM connection successful' });
    } catch (error) {
        console.error('MDM connection failed:', error);
        res.status(500).json({ error: "MDM Connection failed" })
    }
});


app.post('/api/cegid/connect', async (req, res) => {
  const dbConfig = req.body;
  try {
      await createCegidPool(dbConfig) // Pass dbConfig to createCegidPool
      res.json({ message: 'CEGID connection successful' })
  } catch (error) {
      console.error('CEGID connection failed', error);
      res.status(500).json({ error: "CEGID Connection failed" })
  }
});





 

app.listen(5000, () => {
    console.log(`Server is running ..... `);
});

module.exports = app;