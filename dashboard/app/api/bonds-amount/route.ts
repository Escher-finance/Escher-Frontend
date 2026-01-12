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
        const dateFrom = searchParams.get("date-from");
        const dateTo = searchParams.get("date-to");

        const client = await pool.connect();

        let query = `
            SELECT DATE(bb."time") AS bond_date, SUM(bb.amount) AS total_bond_amount
            FROM babylon_bond bb
        `;
        const params: any[] = [];

        if (dateFrom && dateTo) {
            query += ` WHERE bb."time" >= $1 AND bb."time" <= $2`;
            params.push(dateFrom, dateTo);
        }

        query += ` GROUP BY DATE(bb."time") ORDER BY bond_date DESC`;

        const result = await client.query(query, params);
        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}