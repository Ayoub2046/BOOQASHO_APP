const createMockDb = require('./mockDb');
const createPgDb = require('./pgDb');

let dbInstance = null;
let isMock = false;

async function initialize() {
  if (process.env.USE_MOCK_DB === 'true') {
    dbInstance = createMockDb();
    isMock = true;
    console.log('📦 [DATABASE] Using in-memory mock database (USE_MOCK_DB=true).');
    return dbInstance;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    dbInstance = createMockDb();
    isMock = true;
    console.log('📦 [DATABASE] No DATABASE_URL found. Using in-memory mock database.');
    return dbInstance;
  }

  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString,
      max: parseInt(process.env.POOL_MAX_ACTIVE || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });
    await pool.query('SELECT 1');
    dbInstance = createPgDb(pool);
    isMock = false;
    console.log('✅ [DATABASE] Connected to Supabase PostgreSQL via direct PG Pool.');
    return dbInstance;
  } catch (err) {
    console.warn(`⚠️ [DATABASE] PostgreSQL unavailable (${err.message}). Falling back to in-memory mock database.`);
    dbInstance = createMockDb();
    isMock = true;
    return dbInstance;
  }
}

function getInstance() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initialize() before handling requests.');
  }
  return dbInstance;
}

const db = {
  initialize,
  get isMock() { return isMock; },
  get pool() { return getInstance().pool; },
  get users() { return getInstance().users; },
  get visits() { return getInstance().visits; },
  get auditLogs() { return getInstance().auditLogs; },
  get otps() { return getInstance().otps; },
  get passwordResets() { return getInstance().passwordResets; },
  get tasks() { return getInstance().tasks; }
};

module.exports = db;
