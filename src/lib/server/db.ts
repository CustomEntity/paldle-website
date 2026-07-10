// src/lib/server/db.ts
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import pg from 'pg';

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: env.DATABASE_URL
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
