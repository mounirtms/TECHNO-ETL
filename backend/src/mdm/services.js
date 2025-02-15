const { mdmPool } = require('../../database');  // Import from database.js


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

module.exports = {
  getUpdatedPrices
};

