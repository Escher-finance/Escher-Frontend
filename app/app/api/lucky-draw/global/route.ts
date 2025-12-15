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
        const resultBabylon = await client.query(`
                select SUM(tickets) as total_tickets from user_lottery_ticket;
            `, []);
        const babylon = Number(resultBabylon.rows[0].total_tickets ?? 0)

        const resultEthereum = await client.query(`
                select SUM(tickets) as total_tickets from eu_user_lottery_ticket;
            `, []);
        const ethereum = Number(resultEthereum.rows[0].total_tickets ?? 0)

        client.release();

        return NextResponse.json({
            babylon,
            ethereum,
            total: babylon + ethereum
        });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}