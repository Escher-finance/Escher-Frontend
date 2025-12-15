import { DEFIS } from '@/lib/defi';
import { Point } from '@/types/points';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

export async function GET(
    req: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const poolAddresses = DEFIS.tower.pools.map(pool => pool.poolAddress);
        const { address } = await params;
        if (!address) {
            throw "Invalid address";
        }

        const client = await pool.connect();
        let result: Point[] = [];
        let resultQuery;

        // HODL
        resultQuery = await client.query(`
                select *
                from babylon_user_point_hodl 
                where user_address = $1
            `, [address]);
        const rowsHodl: Point | undefined = ((resultQuery.rowCount ?? 0) > 0) ? {
            type: 'hodl',
            user_address: resultQuery.rows[0].user_address,
            height: resultQuery.rows[0].height,
            points: resultQuery.rows[0].total_hodl,
            speed: resultQuery.rows[0].delta_hodl
        } : undefined;
        if (rowsHodl) {
            result = result.concat(rowsHodl);
        }

        // DEFI
        resultQuery = await client.query(`
                select *
                from babylon_user_point_defi_lp 
                where user_address = $1
                and lp_address = ANY($2)
            `, [address, poolAddresses]);

        const rowsDefi: Point[] | undefined = ((resultQuery.rowCount ?? 0) > 0) ? resultQuery.rows.map(row => ({
            type: 'defi',
            pool_address: row.lp_address,
            user_address: row.user_address,
            height: row.height,
            points: row.total_defi_lp,
            speed: row.delta_defi_lp
        })) : undefined;
        if (rowsDefi) {
            result = result.concat(rowsDefi);
        }

        client.release();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}