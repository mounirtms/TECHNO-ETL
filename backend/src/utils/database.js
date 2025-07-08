import sql from 'mssql';

// Functions to create pools (now accepting dbConfig as argument)
const getPool = (dbName) => {
  if (dbName === 'mdm') {
    if (!mdmPool) {
      throw new Error("MDM Pool not initialized. Call createMdmPool() first.");
    }
    return mdmPool;
  } else if (dbName === 'cegid') {
    if (!cegidPool) {
      throw new Error("CEGID Pool not initialized. Call createCegidPool() first.");
    }
    return cegidPool;
  } else if (dbName === 'mdm360') {
    if (!mdm360Pool) {
      throw new Error("MDM360 Pool not initialized. Call createMdm360Pool() first.");
    }
    return mdm360Pool;
  } else {
    throw new Error("Invalid database name.");
  }
};

let mdmPool = null;
let mdm360Pool = null;
let cegidPool = null;

async function createMdmPool(dbConfig) { // Accepts the dbconfig
  try {
    if (!mdmPool) { // only initializes if no pool exists
      mdmPool = new sql.ConnectionPool(dbConfig);
      await mdmPool.connect();
      console.log("✅  Connected to MDM DB successfully !");
    }
    return mdmPool;
  } catch (error) {
    console.error('Error MDM connection error:', error);
    throw error;
  }
}

async function createMdm360Pool(dbConfig) { // Accepts the dbconfig
  try {
    if (!mdm360Pool) { // only initializes if no pool exists
      mdm360Pool = new sql.ConnectionPool(dbConfig);
      await mdm360Pool.connect();
      console.log("✅  Connected to MDM360 DB successfully");
    }
    return mdm360Pool;
  } catch (error) {
    console.error('Error MDM360 connection error:', error);
    throw error;
  }
}

async function createCegidPool(dbConfig) {
  try {
    if (!cegidPool) { //only initializes if no pool exists
      cegidPool = new sql.ConnectionPool(dbConfig);
      await cegidPool.connect();
      console.log('✅  connected to CEGID successfully');
    }
    return cegidPool;
  } catch (error) {
    console.error('CEGID connection failed', error);
    throw error;
  }
}

export { createMdmPool, createCegidPool, createMdm360Pool, getPool };