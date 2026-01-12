import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET() {
  try {
    const client = await pgUnionPool.connect();
    try {
      const result = await client.query(
        `
          select DATE(uu."time") as bond_date , COUNT(*) as total_bond
          from union_bond uu
          group by DATE(uu."time")
          order by bond_date DESC
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


