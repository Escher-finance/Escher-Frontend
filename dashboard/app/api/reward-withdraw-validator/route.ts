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
        const validator = searchParams.get("validator");
        const dateFrom = searchParams.get("date-from");
        const dateTo = searchParams.get("date-to");

        if (!validator) {
            throw "Validator params required";
        }

        const client = await pool.connect();

        let query = `
            SELECT 
                reward_date,
                SUM(amount) AS total_amount,
                validator
            FROM (
                SELECT 
                    (br."withdraw_time" AT TIME ZONE 'UTC' AT TIME ZONE 'IST')::date AS reward_date,
                    br.amount,
                    br."validator"
                FROM babylon_withdraw_reward br
                WHERE br."validator" = $1
            ) sub
        `;
        const params: any[] = [];
        params.push(validator);

        if (dateFrom && dateTo) {
            query += `
                WHERE reward_date >= $2::date
                AND reward_date <= $3::date
            `;
            params.push(dateFrom, dateTo);
        }

        query += `
            GROUP BY reward_date, validator
            ORDER BY reward_date DESC
        `;

        const result = await client.query(query, params);
        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}