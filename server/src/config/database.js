/**
 * PostgreSQL Database Configuration
 * Connection Pool bilan — yuqori performance
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Connection event listeners
pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

/**
 * Database'ga ulanish va test qilish
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ PostgreSQL connected: ${result.rows[0].now}`);
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Query helper — parameterized queries (SQL injection himoya)
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && duration > 100) {
    console.log(`⚠️ Slow query (${duration}ms):`, text.substring(0, 80));
  }
  return result;
};

/**
 * Transaction helper
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export { pool, query, transaction };
export default connectDB;
