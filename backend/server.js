const express = require('express');
const sql = require('mssql');
const cron = require('node-cron');
const { createMdmPool, createCegidPool, getPool } = require('./database');

const app = express();

app.use(express.json()); // Enable parsing JSON request bodies


const dbConfigMdM = {
    user: "",
    password: "",
    server: "",
    database: "",
    port: 1433,
    options: {
        encrypt: false, // Disable encryption
        trustServerCertificate: true, // Trust self-signed certificates
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1.2'
        },
        enableArithAbort: true,
        connectionTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}


// Connection endpoints
app.post('/api/mdm/connect', async (req, res) => {
    const dbConfig = req.body;
    Object.assign(dbConfig, {
        options: {
            encrypt: false, // Disable encryption
            trustServerCertificate: true, // Trust self-signed certificates
            cryptoCredentialsDetails: {
                minVersion: 'TLSv1.2'
            },
            enableArithAbort: true,
            connectionTimeout: 30000
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    });
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




// Replace direct connection with pool
const pool = new sql.ConnectionPool(dbConfigMdM);

// Handle pool events
pool.on('error', err => {
    console.error('SQL Pool Error:', err);
});

async function connectToDatabase() {
    try {
        await pool.connect();
        console.log("Connected to the database successfully.");
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

// Function to get the table schema
async function getTableSchema() {
    try {
        const schemaResult = await pool.request().query(`
            SELECT * 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Objectifs_Agents'
        `);
        return schemaResult.recordset;
    } catch (err) {
        console.error('Failed to retrieve table schema:', err);
        return [];
    }
}

// Function to generate mock data based on schema
function generateMockData(schema) {
    const mockData = {};
    schema.forEach(column => {
        switch (column.DATA_TYPE) {
            case 'int':
                mockData[column.COLUMN_NAME] = Math.floor(Math.random() * 1000);
                break;
            case 'float':
                mockData[column.COLUMN_NAME] = Math.random() * 1000;
                break;
            case 'nvarchar':
                mockData[column.COLUMN_NAME] = `mab_user_${Math.floor(Math.random() * 100)}`;
                break;
            case 'datetime':
                mockData[column.COLUMN_NAME] = new Date(Date.now() - Math.random() * 10000000000);
                break;
            default:
                mockData[column.COLUMN_NAME] = null; // Default value for unsupported types
        }
    });
    return mockData;
}

async function insertMockData(mockData) {
    try {
        const columns = Object.keys(mockData).join(', ');
        const values = Object.values(mockData).map(value => {
            if (typeof value === 'string') {
                return `'${value}'`; // Wrap strings in quotes
            }
            return value;
        }).join(', ');

        console.log("Inserting into columns:", columns);
        console.log("With values:", values);

        const insertResult = await pool.request().query(`
            INSERT INTO Objectifs_Agents (${columns}) 
            VALUES (${values})
        `);
        console.log("Mock data inserted successfully:", insertResult);
    } catch (err) {
        console.error('Failed to insert mock data:', err);
    }
}

// Function to get the schema of all tables in the database
async function getAllTableSchemas() {
    try {
        // Get the list of all tables
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);

        const tableSchemas = [];

        for (const table of tablesResult.recordset) {
            const schemaResult = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table.TABLE_NAME}'
            `);
            tableSchemas.push({
                tableName: table.TABLE_NAME,
                columns: schemaResult.recordset
            });
        }

        console.log("All Table Schemas:", tableSchemas);
        return tableSchemas;
    } catch (err) {
        console.error('Failed to retrieve table schemas:', err);
        return [];
    }
}

 

// Start the process
main();
// Function to get the last 10 records from the Objectifs_Agents table
async function getLast10Records() {
    try {
        const result = await pool.request().query(`
            SELECT TOP 10 * 
            FROM Objectifs_Agents 
            ORDER BY ID DESC
        `);
        console.log("Last 10 records:", result.recordset);
        return result.recordset;
    } catch (err) {
        console.error('Failed to retrieve last 10 records:', err);
        return [];
    }
}

// Function to grant read and write permissions to a user on a specified table
async function grantPermissions(username, tableName) {
    try {
        // Grant SELECT (read) permission
        await pool.request().query(`
            GRANT SELECT ON dbo.${tableName} TO [${username}]
        `);
        
        // Grant INSERT (write) permission
        await pool.request().query(`
            GRANT INSERT ON dbo.${tableName} TO [${username}]
        `);
        
        console.log(`Granted SELECT and INSERT permissions on ${tableName} to user ${username}.`);
    } catch (err) {
        console.error(`Failed to grant permissions on ${tableName} to user ${username}:`, err);
    }
}

// Function to display current permissions for a given user on a specified table
async function displayUserPermissions(username, tableName) {
    try {
        const result = await pool.request().query(`
            EXECUTE AS USER = '${username}';
            SELECT * 
            FROM fn_my_permissions('dbo.${tableName}', 'OBJECT');
            REVERT;
        `);
        
        console.log(`Permissions for user ${username} on table ${tableName}:`, result.recordset);
        return result.recordset;
    } catch (err) {
        console.error(`Failed to retrieve permissions for user ${username} on table ${tableName}:`, err);
        return [];
    }
}

// Main function to run the operations
async function main() {
    await connectToDatabase();
    //const allSchemas = await getAllTableSchemas();
    //console.log("Fetched all table schemas:", allSchemas);
    //const schema = await getTableSchema();
    //console.log(schema);
    //const last10Records = await getLast10Records();
    //console.log("Fetched last 10 records:", last10Records);
    //const mockData = generateMockData(schema);
    //console.log(mockData);
 
    
    // Grant permissions to a specific user on the Objectifs_Agents table
    //await grantPermissions('YourUserName', 'Objectifs_Agents');

    const permissions = await displayUserPermissions('Reporting_MDM', 'Objectifs_Agents');
    console.log("Fetched permissions:", permissions)
    
mockData = {
    Source: 6,
    CleUser: 212004,
    UserName: 'DJENAT.KH',
    Exercice: 2025,
    DateDebut: '2025-04-01T00:00:00.000Z',
    DateFin: '2025-04-30T00:00:00.000Z',
    Type: 'REC',
    Montant_Objectifs: 1426229.50819672,
    ID_Mois: 3
  }
    //await insertMockData(mockData);
}

// Start the process
main();
app.listen(5000, () => {
    console.log(`Server is running ..... `);
});


module.exports = app;