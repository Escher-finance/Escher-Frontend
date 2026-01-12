import { NextResponse } from 'next/server';
import { pgUnionPool } from '@/lib/db-union';

export async function GET() {
  try {
    const client = await pgUnionPool.connect();
    try {
      const result = await client.query(
        `
          SELECT DATE(uu."time") AS bond_date, SUM(uu.amount) AS total_bond_amount
          FROM union_bond uu
          GROUP BY DATE(uu."time")
          ORDER BY bond_date DESC
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


