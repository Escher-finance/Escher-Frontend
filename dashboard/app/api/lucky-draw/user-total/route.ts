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
        const { searchParams } = new URL(req.url);
        let address = searchParams.get('address')?.toLowerCase();
        if (!address) {
            throw "Invalid address";
        }

        const client = await pool.connect();
        const result = await client.query(`
                select
                    user_address,
                    SUM(tickets) as total_tickets
                from
                    user_lottery_ticket
                where user_address = $1
                group by
                    user_address
                order by
                    total_tickets desc
            `, [address]);

        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
    }
}