import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET(
    req: Request,
    { params }: { params: Promise<{}> }
) {
    try {
        const client = await pgUnionPool.connect();

        // BOND
        let result = await client.query(`
            SELECT 
                SUM(br.amount) AS total_amount, 
                SUM(br.fee) AS total_fee
            FROM union_reward br
            WHERE DATE(br."time") > '2025-04-29 00:00:00'
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