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
            select DATE(bur."time") as unbond_date , COUNT(*) as total_unbond
            from babylon_unbond_request bur 
            group by DATE(bur."time")
            order by unbond_date DESC
            limit 30
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