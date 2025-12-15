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
                select
                    height, DATE(datetime) as ticket_date
                from
                    user_lottery_ticket
                order by
                    ticket_date desc
                limit 1
            `, []);

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}