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

        let result = await client.query(`
                select bb.id , bb.submitted , bb.released , bb.unstake_amount , bb.undelegate_amount 
                from babylon_batch bb 
                where bb.released isnull
                order by bb.id asc
            `, []);

        client.release();

        return NextResponse.json(
            result.rows
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}