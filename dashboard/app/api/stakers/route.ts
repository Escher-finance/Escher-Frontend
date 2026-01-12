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
                select count(distinct(bb.staker)) as unique_staker
                from babylon_bond bb;
            `, []);

        client.release();

        // return NextResponse.json({
        //     rowsBatch,
        //     rowsUnbond
        // });

        return NextResponse.json(
            result.rows[0]
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}