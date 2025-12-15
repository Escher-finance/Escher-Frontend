import { CHAINS } from "@/configs/chains";
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

// test evm 0x42f36d45381e3f5d9443e872b6192aaf0db55b53

export async function GET(
    req: Request,
) {
    try {
        const poolAddressesBabylon = DEFIS.tower.pools.map(pool => pool.poolAddress);
        const poolAddressesUnion = ["0xc58e9e692352cccba57c66a3585a2384754dc5d6"];

        const { searchParams } = new URL(req.url);
        const cosmos = searchParams.get('cosmos')?.toLowerCase();
        const evm = searchParams.get('evm')?.toLowerCase();
        if (!cosmos && !evm) {
            throw "Invalid address";
        }

        const client = await pool.connect();
        let result: Point[] = [];
        let resultQuery;
        let rowsHodl: Point | undefined;

        // HODL BABYLON
        resultQuery = await client.query(`
                select *
                from babylon_user_point_hodl 
                where user_address = $1
            `, [cosmos]);
        rowsHodl = ((resultQuery.rowCount ?? 0) > 0) ? {
            type: 'hodl',
            user_address: resultQuery.rows[0].user_address,
            chainId: CHAINS.babylon.id,
            height: resultQuery.rows[0].height,
            points: resultQuery.rows[0].total_hodl,
            speed: resultQuery.rows[0].delta_hodl
        } : undefined;
        if (rowsHodl) {
            result = result.concat(rowsHodl);
        }

        // HODL UNION
        resultQuery = await client.query(`
                select *
                from eu_ethereum_user_point_hodl 
                where user_address = $1
            `, [evm]);
        rowsHodl = ((resultQuery.rowCount ?? 0) > 0) ? {
            type: 'hodl_union',
            user_address: resultQuery.rows[0].user_address,
            chainId: CHAINS.mainnet.id.toString(),
            height: resultQuery.rows[0].height,
            points: resultQuery.rows[0].total_hodl,
            speed: resultQuery.rows[0].delta_hodl
        } : undefined;
        if (rowsHodl) {
            result = result.concat(rowsHodl);
        }

        // HODL EVM
        resultQuery = await client.query(`
                select *
                from ethereum_user_point_hodl 
                where user_address = $1
            `, [evm]);
        rowsHodl = ((resultQuery.rowCount ?? 0) > 0) ? {
            type: 'hodl',
            user_address: resultQuery.rows[0].user_address,
            chainId: CHAINS.mainnet.id,
            height: resultQuery.rows[0].height,
            points: resultQuery.rows[0].total_hodl,
            speed: resultQuery.rows[0].delta_hodl
        } : undefined;
        if (rowsHodl) {
            result = result.concat(rowsHodl);
        }

        // DEFI babylon
        resultQuery = await client.query(`
                select *
                from babylon_user_point_defi_lp 
                where user_address = $1
                and lp_address = ANY($2)
            `, [cosmos, poolAddressesBabylon]);

        const rowsDefiBabylon: Point[] | undefined = ((resultQuery.rowCount ?? 0) > 0) ? resultQuery.rows.map(row => ({
            type: 'defi',
            pool_address: row.lp_address,
            user_address: row.user_address,
            height: row.height,
            points: row.total_defi_lp,
            speed: row.delta_defi_lp
        })) : undefined;
        if (rowsDefiBabylon) {
            result = result.concat(rowsDefiBabylon);
        }

        // DEFI union
        resultQuery = await client.query(`
                select *
                from eu_ethereum_user_point_defi_lp 
                where user_address = $1
                and lp_address = ANY($2)
            `, [evm, poolAddressesUnion]);

        const rowsDefiUnion: Point[] | undefined = ((resultQuery.rowCount ?? 0) > 0) ? resultQuery.rows.map(row => ({
            type: 'defi_union',
            pool_address: row.lp_address,
            user_address: row.user_address,
            height: row.height,
            points: row.total_defi_lp,
            speed: row.delta_defi_lp
        })) : undefined;
        if (rowsDefiUnion) {
            result = result.concat(rowsDefiUnion);
        }

        // EXTRA
        resultQuery = await client.query(`
                select *
                from user_point_extra 
                where user_address = $1
            `, [cosmos]);

        const rowsExtra: Point[] | undefined = ((resultQuery.rowCount ?? 0) > 0) ? resultQuery.rows.map(row => ({
            type: 'extra',
            user_address: row.user_address,
            points: row.total_extra,
        })) : undefined;
        if (rowsExtra) {
            result = result.concat(rowsExtra);
        }

        client.release();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}