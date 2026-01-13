import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET(
    req: Request,
    { params }: { params: Promise<{}> }
) {
    try {
        const client = await pgUnionPool.connect();

        let result = await client.query(`
                select bb.id , bb.submitted , bb.released , bb.unstake_amount , bb.undelegate_amount
                from union_batch bb 
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