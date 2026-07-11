// src/lib/server/db.ts
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import pg from 'pg';

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: env.DATABASE_URL,
            // Recycle our idle clients before pgbouncer/the server reaps them,
            // so we never hand out a socket the server has already killed.
            idleTimeoutMillis: 10_000,
            keepAlive: true
        });
        // node-postgres crashes the ENTIRE process on an unhandled pool 'error'
        // event (e.g. an idle connection dropped by pgbouncer). Without this
        // listener the dev server dies "au moindre truc". Swallow it — the next
        // query just opens a fresh connection.
        pool.on('error', (err) => {
            console.error('pg pool error (recovered, not fatal):', err.message);
        });
    }
    return pool;
}

export async function queryDatabase<T>(statement: string, params?: any[]): Promise<T> {
    const client = await getPool().connect();
    try {
        const result = await client.query(statement, params);
        return result.rows as T;
    } catch (err) {
        console.error('Database query error:', err);
        throw error(500, { message: 'Database connection failed' });
    } finally {
        client.release();
    }
}
