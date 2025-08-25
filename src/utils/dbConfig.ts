import sql from 'mssql';
import config from '../config/config';

const sqlConfig = config.database.sqlServer;

const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('SQL Server Error:', err);
});

export async function getConnection() {
    await poolConnect;
    return pool;
}

// Test connection function
export async function testConnection() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT @@VERSION AS Version');
        console.log('Successfully connected to SQL Server');
        console.log('SQL Server Version:', result.recordset[0].Version);
        return true;
    } catch(err: any) {
        console.error('Error connecting to SQL Server:', err);
        return false;
    }
}

export default {
    getConnection,
    testConnection,
    sql
};