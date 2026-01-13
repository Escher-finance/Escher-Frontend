import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

export async function GET(
    req: Request,
    { params }: { params: Promise<{}> }
) {
    try {
        const client = await pool.connect();

        // BOND
        let result = await client.query(`
            SELECT 
                SUM(br.amount) AS total_amount, 
                SUM(br.fee) AS total_fee
            FROM babylon_reward br
            WHERE DATE(br."time") > '2025-04-29 00:00:00'
        `, []);

        client.release();

        return NextResponse.json(
            result.rows
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}