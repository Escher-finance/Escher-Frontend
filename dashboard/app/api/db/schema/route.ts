import { NextResponse } from "next/server";
import { pgPool } from "@/lib/db";

export async function GET() {
  try {
    const client = await pgPool.connect();
    try {
      const tablesRes = await client.query(
        `select table_schema, table_name
         from information_schema.tables
         where table_type='BASE TABLE'
           and table_schema not in ('pg_catalog','information_schema')
         order by table_schema, table_name`
      );

      const tables = tablesRes.rows as { table_schema: string; table_name: string }[];

      const results = [] as Array<{
        schema: string;
        table: string;
        columns: Array<{ name: string; data_type: string; is_nullable: string; column_default: string | null }>;
      }>

      for (const t of tables) {
        const colsRes = await client.query(
          `select column_name, data_type, is_nullable, column_default
           from information_schema.columns
           where table_schema = $1 and table_name = $2
           order by ordinal_position`,
          [t.table_schema, t.table_name]
        );

        results.push({
          schema: t.table_schema,
          table: t.table_name,
          columns: colsRes.rows.map(r => ({
            name: r.column_name,
            data_type: r.data_type,
            is_nullable: r.is_nullable,
            column_default: r.column_default ?? null,
          }))
        });
      }

      return NextResponse.json({ tables: results });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}


