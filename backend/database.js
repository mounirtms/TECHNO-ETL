const sql = require('mssql');

let mdmPool = null;
let cegidPool = null;

// Functions to create pools (now accepting dbConfig as argument)

async function createMdmPool(dbConfig) { // Accepts the dbconfig
    try {
        if (!mdmPool){ // only initializes if no pool exists
            mdmPool = new sql.ConnectionPool(dbConfig);
            await mdmPool.connect();
            console.log("Connected to MDM DB successfully");
        }
        return mdmPool;
    }catch (error) {
        console.error('Error MDM connection error:', error);
        throw error;
    }
}


async function createCegidPool(dbConfig) {
    try {
        if (!cegidPool){ //only initializes if no pool exists
            cegidPool = new sql.ConnectionPool(dbConfig)
            await cegidPool.connect();
            console.log('Connected to CEGID successfully')
        }

        return cegidPool;
    } catch (error) {
        console.error('CEGID connection failed', error);
        throw error;
    }
}

const getPool = (dbName) => {
  if (dbName === 'mdm') {
    if(!mdmPool){
      throw new Error("MDM Pool not initialized. Call createMdmPool() first.");
    }
    return mdmPool;
  } else if (dbName === 'cegid') {
    if(!cegidPool){
      throw new Error("CEGID Pool not initialized. Call createCegidPool() first.");
    }
    return cegidPool
  } else {
    throw new Error("Invalid database name.");
  }
};

 
 module.exports = { createMdmPool, createCegidPool, getPool };
