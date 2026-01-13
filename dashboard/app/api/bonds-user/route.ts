import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get("address");

        const client = await pool.connect();

        let query = `
            SELECT bb.staker , SUM(bb.amount) as amount, count(bb.staker) as count
            FROM babylon_bond bb
        `;
        const params: any[] = [];

        if (address && address !== "") {
            query += ` WHERE bb.staker = $1`;
            params.push(address);
        }

        query += `
            group by bb.staker
            order by amount desc 
            limit 10
        `;

        const result = await client.query(query, params);
        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}