import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(
    req: Request,
) {
    try {
        const { searchParams } = new URL(req.url);
        const lst = searchParams.get('lst')?.toLowerCase();

        if (!lst) {
            throw "Unknown LST"
        }

        if (lst === "babylon") {
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false,
                },
            });
            const client = await pool.connect();

            const result = await client.query(`
                select bb.id , bb.submitted , bb.released , bb.unstake_amount , bb.undelegate_amount
                from babylon_batch bb 
                where bb.released isnull
                order by bb.id asc
            `, []);

            client.release();

            return NextResponse.json(
                result.rows
            );
        }
        if (lst === "union") {
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL_UNION,
                ssl: {
                    rejectUnauthorized: false,
                },
            });
            const client = await pool.connect();

            const result = await client.query(`
                select bb.id , bb.submitted , bb.released , bb.unstake_amount , bb.undelegate_amount
                from union_batch bb 
                where bb.released isnull
                order by bb.id asc
            `, []);

            client.release();

            return NextResponse.json(
                result.rows
            );
        }

        return NextResponse.json({ error: "Unknown LST" }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
