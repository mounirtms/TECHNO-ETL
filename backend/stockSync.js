const cron = require('node-cron');
const sql = require('mssql');
const fs = require('fs/promises');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// MSSQL Configuration from environment variables
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    server: process.env.DB_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // For Azure, set to true
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
};

/**
 * Executes the stock synchronization task.
 */
async function syncStock() {
    console.log('Running stock synchronization task...');
    let pool;
    try {
        // Read the SQL query from the file
        const queryPath = path.join(__dirname, 'queries', 'sync-stock.sql');
        const mergeQuery = await fs.readFile(queryPath, 'utf-8');

        if (!mergeQuery) {
            console.error('Error: SQL query file is empty or could not be read.');
            return;
        }

        // Connect to the database
        pool = await sql.connect(sqlConfig);

        // Execute the query
        const result = await pool.request().query(mergeQuery);

        console.log('Stock synchronization task completed successfully.');
        console.log(`${result.rowsAffected[0]} rows were affected.`);

    } catch (err) {
        console.error('Error during stock synchronization:', err);
    } finally {
        if (pool) {
            pool.close();
        }
    }
}

// Schedule the task to run once every day at 2:00 AM.
// You can change the cron expression as needed. e.g., '*/5 * * * *' to run every 5 minutes for testing.
cron.schedule('0 2 * * *', () => {
    syncStock();
}, {
    scheduled: true,
    timezone: "Europe/Paris" // Set to your server's timezone
});

console.log('Stock synchronization cron job scheduled to run daily at 2:00 AM.');
