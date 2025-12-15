import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

export async function GET() {
    try {
        const client = await pool.connect();

        // BOND
        const result = await client.query(`
            select bi.amount 
            from babylon_injection bi 
        `, []);

        client.release();

        return NextResponse.json(
            result.rows
        );
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}