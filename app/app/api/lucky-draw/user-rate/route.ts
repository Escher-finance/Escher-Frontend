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
        let babylon = {
            user_address: null,
            hodl_ticket_rate: 0,
            hodl_avg_usd: 0,
            lp_ticket_rate: 0,
            lp_avg_usd: 0
        };
        if (addressBabylon) {
            const resultBabylon = await client.query(`
                select
                    user_address,
                    hodl_ticket_rate,
                    hodl_avg_usd,
                    lp_ticket_rate,
                    lp_avg_usd
                from
                    user_lottery_ticket_rate
                where user_address = $1
            `, [addressBabylon]);

            if ((resultBabylon.rowCount ?? 0) > 0) {
                babylon = {
                    user_address: resultBabylon.rows[0].user_address,
                    hodl_ticket_rate: Number(resultBabylon.rows[0].hodl_ticket_rate),
                    hodl_avg_usd: Number(resultBabylon.rows[0].hodl_avg_usd),
                    lp_ticket_rate: Number(resultBabylon.rows[0].lp_ticket_rate),
                    lp_avg_usd: Number(resultBabylon.rows[0].lp_avg_usd)
                }
            }
        }

        // ethereum
        let union = {
            user_address: null,
            hodl_ticket_rate: 0,
            hodl_avg_usd: 0,
            lp_ticket_rate: 0,
            lp_avg_usd: 0
        };
        if (addressEthereum) {
            const resultUnion = await client.query(`
                select
                    user_address,
                    hodl_ticket_rate,
                    hodl_avg_usd,
                    lp_ticket_rate,
                    lp_avg_usd
                from
                    eu_user_lottery_ticket_rate
                where user_address = $1
            `, [addressEthereum]);

            if ((resultUnion.rowCount ?? 0) > 0) {
                union = {
                    user_address: resultUnion.rows[0].user_address,
                    hodl_ticket_rate: Number(resultUnion.rows[0].hodl_ticket_rate),
                    hodl_avg_usd: Number(resultUnion.rows[0].hodl_avg_usd),
                    lp_ticket_rate: Number(resultUnion.rows[0].lp_ticket_rate),
                    lp_avg_usd: Number(resultUnion.rows[0].lp_avg_usd)
                }
            }
        }

        client.release();
        return NextResponse.json({
            babylon,
            union
        });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}