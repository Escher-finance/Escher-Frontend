import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET() {
  try {
    const client = await pgUnionPool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(DISTINCT staker) AS unique_stakers FROM union_bond;`
      );
      const value = Number(result.rows?.[0]?.unique_stakers ?? 0);
      return NextResponse.json({ unique_stakers: value });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Internal Server Error' }, { status: 500 });
  }
}


