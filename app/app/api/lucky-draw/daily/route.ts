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
        const result = await client.query(`
                SELECT
                    DATE(datetime) AS ticket_date,
                    SUM(tickets) AS total_tickets,
                    COUNT(DISTINCT user_address) AS unique_users
                FROM (
                    SELECT datetime, tickets, user_address FROM user_lottery_ticket
                    UNION ALL
                    SELECT datetime, tickets, user_address FROM eu_user_lottery_ticket
                ) AS combined
                GROUP BY
                    DATE(datetime)
                ORDER BY
                    ticket_date DESC
                LIMIT 10;
            `, []);

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}