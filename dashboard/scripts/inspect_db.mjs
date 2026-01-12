import fs from 'fs';
import { Client } from 'pg';

function getConnectionString() {
  const envPath = new URL('../.env.local', import.meta.url);
  const raw = fs.readFileSync(envPath, 'utf8');
  const line = raw.split('\n').find(l => l.startsWith('POSTGRES_URL='));
  if (!line) throw new Error('POSTGRES_URL not found in .env.local');
  let cs = line.slice('POSTGRES_URL='.length).trim();
  if ((cs.startsWith('"') && cs.endsWith('"')) || (cs.startsWith("'") && cs.endsWith("'"))) {
    cs = cs.slice(1, -1);
  }
  return cs;
}

async function main() {
  const connectionString = getConnectionString();
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const { rows: tables } = await client.query(
      `select table_schema, table_name
       from information_schema.tables
       where table_type='BASE TABLE'
         and table_schema not in ('pg_catalog','information_schema')
       order by table_schema, table_name`
    );

    const out = [];
    for (const t of tables) {
      const { rows: cols } = await client.query(
        `select column_name, data_type, is_nullable, column_default
         from information_schema.columns
         where table_schema = $1 and table_name = $2
         order by ordinal_position`,
        [t.table_schema, t.table_name]
      );
      out.push({ schema: t.table_schema, table: t.table_name, columns: cols });
    }
    console.log(JSON.stringify({ tables: out }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});


