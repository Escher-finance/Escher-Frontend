import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateFrom = searchParams.get("date-from");
        const dateTo = searchParams.get("date-to");

        const client = await pgUnionPool.connect();

        let query = `
            SELECT 
                (br."time" AT TIME ZONE 'UTC' AT TIME ZONE 'IST')::date AS reward_date,
                SUM(br.amount) AS total_amount, 
                SUM(br.fee) AS total_fee
            FROM union_reward br
        `;
        const params: any[] = [];

        if (dateFrom && dateTo) {
            query += ` WHERE br."time" >= $1 AND br."time" <= $2`;
            params.push(dateFrom, dateTo);
        }

        query += ` GROUP BY reward_date ORDER BY reward_date DESC`;

        const result = await client.query(query, params);
        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}