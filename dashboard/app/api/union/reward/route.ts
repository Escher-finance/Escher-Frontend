import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET(
    req: Request,
    { params }: { params: Promise<{}> }
) {
    try {
        const client = await pgUnionPool.connect();

        let result = await client.query(`
                select COALESCE(SUM(br.fee), 0) as profit
                from union_reward br
            `, []);

        client.release();

        return NextResponse.json(
            result.rows[0]
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}