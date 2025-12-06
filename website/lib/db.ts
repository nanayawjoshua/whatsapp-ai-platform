/**
 * Database Connection for Website
 * Connects to the same Neon PostgreSQL database as the cloud bridge
 */

import { Pool } from 'pg';

// Create a singleton connection pool
let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL or NEON_DATABASE_URL not configured');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false // Required for Neon
      },
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }

  return pool;
}

/**
 * Execute a query with proper error handling
 */
export async function query(text: string, params?: any[]) {
  const db = getDb();
  try {
    const start = Date.now();
    const result = await db.query(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn('Slow query detected:', { text, duration });
    }

    return result;
  } catch (error: any) {
    console.error('Database query error:', {
      message: error.message,
      query: text,
      params
    });
    throw error;
  }
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const db = getDb();
  const client = await db.connect();

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
}

/**
 * Close database connections (for graceful shutdown)
 */
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
