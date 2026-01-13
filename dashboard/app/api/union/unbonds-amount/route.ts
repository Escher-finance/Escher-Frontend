import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET() {
  try {
    const client = await pgUnionPool.connect();
    try {
      const result = await client.query(
        `
          select DATE(bur."time") as unbond_date , SUM(bur.amount) as total_unbond_amount
          from union_unbond_request bur
          group by DATE(bur."time")
          order by unbond_date DESC
          limit 30
        `
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Internal Server Error' }, { status: 500 });
  }
}


