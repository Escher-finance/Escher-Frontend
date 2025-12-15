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
        const addressBabylon = searchParams.get('babylon')?.toLowerCase();
        const addressEthereum = searchParams.get('ethereum')?.toLowerCase();
        if (!addressBabylon && !addressEthereum) {
            throw "Invalid address";
        }

        const client = await pool.connect();

        // babylon
        let babylon = 0;
        if (addressBabylon) {
            const resultBabylon = await client.query(`
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
            `, [addressBabylon]);
            babylon = Number(resultBabylon.rows[0]?.total_tickets ?? 0)
        }

        // ethereum
        let ethereum = 0;
        if (addressEthereum) {
            const resultEthereum = await client.query(`
                select
                    user_address,
                    SUM(tickets) as total_tickets
                from
                    eu_user_lottery_ticket
                where user_address = $1
                group by
                    user_address
                order by
                    total_tickets desc
            `, [addressEthereum]);
            ethereum = Number(resultEthereum.rows[0]?.total_tickets ?? 0)
        }

        client.release();
        return NextResponse.json({
            babylon,
            ethereum
        });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}