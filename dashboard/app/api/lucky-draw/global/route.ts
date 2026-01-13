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
) {
    try {
        const client = await pool.connect();
        const result = await client.query(`
                select SUM(tickets) as total_tickets from user_lottery_ticket;
            `, []);

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
    }
}