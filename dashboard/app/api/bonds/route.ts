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
                select DATE(bb."time") as bond_date , COUNT(*) as total_bond
                from babylon_bond bb 
                group by DATE(bb."time")
                order by bond_date DESC
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