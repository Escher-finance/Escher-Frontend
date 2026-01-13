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
                select
                    DATE(datetime) as ticket_date,
                    SUM(tickets) as total_tickets,
                    COUNT(distinct user_address) as unique_users
                from
                    user_lottery_ticket
                group by
                    DATE(datetime)
                order by
                    ticket_date desc;
            `, []);

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
    }
}