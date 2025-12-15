import { APP_CONFIG } from '@/configs/app';
import { BABYLON_CONTRACTS } from '@/configs/babylon';
import { IndexerTransaction } from '@/types/transaction';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
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

    const local = false;

    try {
        const { address } = await params;
        const { searchParams } = new URL(req.url);
        const evm = searchParams.get('evm')?.toLowerCase();
        if (!address) {
            throw "Invalid address";
        }

        const client = await pool.connect();
        let result: IndexerTransaction[] = [];
        let resultQuery;

        // BOND
        let queryValues = [address];
        let whereClause = `WHERE staker = $1`;
        if (evm) {
            queryValues.push(evm);
            whereClause += ` OR staker = $2`;
        }
        resultQuery = await client.query(`
                SELECT "amount", "output", ${local ? `"time" + INTERVAL '7 hours"` : `"time"`} AS "time", 
                    "denom", "channel_id", "hash", "staker", "recipient", "recipient_channel_id"
                FROM babylon_bond
                ${whereClause}
            `,
            queryValues
        );
        const rowsBond: IndexerTransaction[] = resultQuery.rows.map(v => ({
            lst: "babylon",
            hash: v.hash,
            action: "bond",
            userAddress: v.staker,
            channelId: v.channel_id,
            recipientChannelId: v.recipient_channel_id === 0 ? null : v.recipient_channel_id,
            recipient: v.recipient === "" ? null : v.recipient,

            denomA: v.denom,
            amountA: v.amount,

            denomB: undefined,
            amountB: v.output,

            exchange_rate: undefined,
            submitted: undefined,

            status: "success",
            time: dayjs(v.time).format(APP_CONFIG.dateTimeFormat),
            source: "indexer"
        }));
        result = result.concat(rowsBond);

        // BATCH
        queryValues = [address];
        whereClause = `WHERE bur.staker = $1`;
        if (evm) {
            queryValues.push(evm);
            whereClause += ` OR bur.staker = $2`;
        }
        resultQuery = await client.query(`
                select bb.id , bur.staker , bur.amount , bur."time" ${local ? `+ INTERVAL '7 hours' as "time"` : ``} , bur.hash , bb.exchange_rate , bb.submitted ${local ? `+ INTERVAL '7 hours' as "submitted"` : ``} , bb.released ${local ? `+ INTERVAL '7 hours' as "released"` : ``} 
                from babylon_batch bb join babylon_unbond_request bur 
                on bb.id = bur.batch_id 
                ${whereClause}
            `, queryValues);
        const rowsBatch = resultQuery.rows;

        // UNBOND
        queryValues = [address];
        whereClause = `WHERE staker = $1`;
        if (evm) {
            queryValues.push(evm);
            whereClause += ` OR staker = $2`;
        }
        resultQuery = await client.query(`
                select "batch_id", "amount", "time" ${local ? `+ INTERVAL '7 hours' as "time"` : ``} , "channel_id", "hash" , "staker", "recipient", "recipient_channel_id"
                from babylon_unbond_request 
                ${whereClause}
            `, queryValues);
        const rowsUnbond: IndexerTransaction[] = resultQuery.rows.map(v => {
            const batch = rowsBatch.find(batch => batch.id == v.batch_id);
            const status = batch?.released ? "success" : "pending";

            return {
                lst: "babylon",
                hash: v.hash,
                action: "unbond",
                userAddress: v.staker,
                channelId: v.channel_id,
                recipientChannelId: v.recipient_channel_id === 0 ? null : v.recipient_channel_id,
                recipient: v.recipient === "" ? null : v.recipient,

                denomA: "ebbn",
                amountA: v.amount,

                denomB: "ubbn",
                amountB: batch ? Number(Number(v.amount) * BigNumber(batch.exchange_rate).shiftedBy(-18).toNumber()).toFixed(0) : undefined,

                exchange_rate: batch ? batch.exchange_rate : undefined,
                submitted: batch ? batch.submitted : undefined,

                status: status,
                time: dayjs(v.time).format(APP_CONFIG.dateTimeFormat),
                source: "indexer"
            };
        });
        result = result.concat(rowsUnbond);

        // Tower
        // Temp
        const poolAddress = "bbn1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgeslpzjvl";
        resultQuery = await client.query(`
            select t.hash , t.user_address, t.lp_address , t.asset_a_denom , t.asset_a_amount , t.asset_b_denom , t.asset_b_amount , t.is_withdrawing , t.height
            from babylon_user_towerfi_lp_tx t
            where t.user_address = $1
            and t.lp_address = $2
        `, [address, poolAddress]);
        await Promise.all(
            resultQuery.rows.map(async (row) => {
                try {
                    const queryHeight = await fetch(`${BABYLON_CONTRACTS.rpc}/header?height=${row.height}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    const heightResponse = (await queryHeight.json()).result.header.time;
                    row.datetime = dayjs(heightResponse).format(APP_CONFIG.dateTimeFormat);
                } catch (error) {
                    console.error('Error fetching user transactions:', error);
                }
            })
        );
        const rowsTower: IndexerTransaction[] = resultQuery.rows.map(v => ({
            lst: "babylon",
            hash: v.hash,
            action: v.is_withdrawing ? "towerRemove" : "towerAdd",
            userAddress: v.user_address,
            channelId: 0,
            recipient: null,
            recipientChannelId: null,

            denomA: v.asset_a_denom,
            amountA: v.asset_a_amount,

            denomB: v.asset_b_denom,
            amountB: v.asset_b_amount,

            exchange_rate: undefined,
            submitted: undefined,

            status: "success",
            time: v.datetime,
            height: v.height,
            source: "indexer"
        }));
        result = result.concat(rowsTower);

        client.release();
        result = result.sort((x, y) => x.time < y.time ? 1 : -1);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
