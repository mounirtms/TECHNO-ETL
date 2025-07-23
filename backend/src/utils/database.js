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

const pools = new Map();
const DEFAULT_POOL_CONFIG = {
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  acquireTimeoutMillis: 5000
};

async function createPool(name, dbConfig) {
  try {
    if (!pools.has(name)) {
      const pool = new sql.ConnectionPool({
        ...DEFAULT_POOL_CONFIG,
        ...dbConfig
      });
      
      await pool.connect();
      pool.on('error', err => {
        logger.error('Database connection error', { pool: name, error: err.message });
      });
      pools.set(name, pool);
      logger.database('connect', name, { config: dbConfig });
    }
    return pools.get(name);
  } catch (error) {
    logger.error('Database connection failed', {
      pool: name,
      error: error.message,
      stack: error.stack
    });
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

  
export { createPool as createMdmPool, getPool };