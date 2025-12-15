import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_UNION,
    ssl: {
        rejectUnauthorized: false,
    },
})

export async function GET() {
    try {
        const client = await pool.connect();

        // BOND
        const result = await client.query(`
            select ub.id, ub.released 
            from union_batch ub
        `, []);

        client.release();

        return NextResponse.json(
            result.rows
        );
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}