const { mdmPool, getPool } = require('../utils/database');  // Import from database.js
const sql = require('mssql'); // Import mssql


async function getUpdatedPrices(daysSinceModified) {
  try {
    // Establish database connection (ideally, use a connection pool)


    const request = mdmPool.request();
    const query = `
      SELECT *
      FROM Tarif
      WHERE Code_TarifType = 9 
      AND DateModif >= DATEADD(DAY, -${daysSinceModified}, GETDATE());
    `;
    const result = await request.query(query);

    // Close the connection (or return it to the pool)
    await pool.close();

    return result.recordset; // Return the data
  } catch (error) {
    console.error("Error executing query:", error); // Log the error
    throw error; // Re-throw the error to be handled by the route
  }
}

async function fetchMDMProducts({ limit = 100, offset = 0, sourceCode = '' }) {

  // Connect to database
  const pool = getPool('mdm')
  const request = pool.request();
 
 

  // Validate limit
  if (isNaN(limit) || limit <= 0) {
    limit = 100;
  }

  try {
    // Connect to database

    const request = pool.request();

    // Add SQL parameters
    request.input('limit', sql.Int, limit);
    if (!isNaN(sourceCode)) {
      request.input('sourceCode', sql.Int, sourceCode);
    }

    // SQL query with dynamic filtering
    const sqlQuery = `
            SELECT TOP (@limit)
                Code_MDM, Code_JDE, TypeProd, Code_Source, Source, Succursale, 
                CAST(QteStock AS INT) AS StockQuantity, 
                CAST(QteReceptionner AS INT) AS ReceivedQuantity, 
                CAST(VenteMoyen AS FLOAT) AS AverageSales, 
                DateDernierMaJ AS LastUpdateDate, 
                CAST(Tarif AS DECIMAL(10,2)) AS Price, 
                TypeConfHomog AS ConfigType
            FROM [MDM_REPORT].[EComm].[ApprovisionnementProduits]
            WHERE QteStock > 0
            ${!isNaN(sourceCode) ? 'AND Code_Source = @sourceCode' : ''}
            ORDER BY DateDernierMaJ DESC
        `;
    const result = await request.query(sqlQuery);
    // Return data as JSON
    console.log(result)

  } catch (error) {
    console.error('Database Fetch Error:', error);
    res.status(500).json({
      error: 'Database Fetch Error',
      details: error.message
    });
  }
}

module.exports = {
  getUpdatedPrices,
  fetchMDMProducts
};

