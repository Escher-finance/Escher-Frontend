import { NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg';

interface PoolAddresses {
    babylon: string[]
    ethereum: string[]
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

async function allPoints(client: PoolClient, address: string | null, poolAddresses: PoolAddresses) {
    let resultQuery;

    const mainQuery = `
        SELECT
            ROW_NUMBER() OVER (
                ORDER BY (
                    COALESCE(baby_lp_agg.total_defi_lp, 0) +
                    COALESCE(eth_lp_agg.total_defi_lp, 0) +
                    COALESCE(evm_union_lp_agg.total_defi_lp, 0) +
                    COALESCE(ebaby_babylon_hodl.total_hodl, 0) +
                    COALESCE(ebaby_ethereum_hodl.total_hodl, 0) +
                    COALESCE(eu_ethereum_hodl.total_hodl, 0) +
                    COALESCE(extra.total_extra, 0)
                ) DESC
            ) AS rank,
            COALESCE(
                baby_lp_agg.user_address,
                ebaby_babylon_hodl.user_address,
                ebaby_ethereum_hodl.user_address,
                eu_ethereum_hodl.user_address,
                extra.user_address
            ) AS user_address,
            (
                COALESCE(ebaby_babylon_hodl.total_hodl, 0) +
                COALESCE(ebaby_ethereum_hodl.total_hodl, 0) +
                COALESCE(eu_ethereum_hodl.total_hodl, 0)
            ) AS hodl_points,
            (
                COALESCE(baby_lp_agg.total_defi_lp, 0) +
                COALESCE(eth_lp_agg.total_defi_lp, 0) +
                COALESCE(evm_union_lp_agg.total_defi_lp, 0)
            ) AS lp_points,
            COALESCE(extra.total_extra, 0) AS extra_points,
            (
                COALESCE(baby_lp_agg.total_defi_lp, 0) +
                COALESCE(eth_lp_agg.total_defi_lp, 0) +
                COALESCE(evm_union_lp_agg.total_defi_lp, 0) +
                COALESCE(ebaby_babylon_hodl.total_hodl, 0) +
                COALESCE(ebaby_ethereum_hodl.total_hodl, 0) +
                COALESCE(eu_ethereum_hodl.total_hodl, 0) +
                COALESCE(extra.total_extra, 0)
            ) AS total_points

        FROM (
            SELECT
                user_address,
                SUM(total_defi_lp) AS total_defi_lp
            FROM
                babylon_user_point_defi_lp
            WHERE
                lp_address = ANY($1)
            GROUP BY
                user_address
        ) baby_lp_agg

        FULL OUTER JOIN babylon_user_point_hodl ebaby_babylon_hodl
            ON baby_lp_agg.user_address = ebaby_babylon_hodl.user_address

        FULL OUTER JOIN ethereum_user_point_hodl ebaby_ethereum_hodl
            ON COALESCE(
                baby_lp_agg.user_address, 
                ebaby_babylon_hodl.user_address
            ) = ebaby_ethereum_hodl.user_address

        FULL OUTER JOIN (
            SELECT
                user_address,
                SUM(total_defi_lp) as total_defi_lp
            FROM
                ethereum_user_point_defi_lp
            WHERE
                lp_address = ANY($2)
            GROUP BY
                user_address
        ) eth_lp_agg
            ON COALESCE(
                baby_lp_agg.user_address, 
                ebaby_babylon_hodl.user_address, 
                ebaby_ethereum_hodl.user_address
            ) = eth_lp_agg.user_address

        FULL OUTER JOIN (
            SELECT
                user_address,
                SUM(total_defi_lp) as total_defi_lp
            FROM
                eu_ethereum_user_point_defi_lp
            WHERE
                lp_address = ANY($2)
            GROUP BY
                user_address
        ) evm_union_lp_agg
            ON COALESCE(
                baby_lp_agg.user_address, 
                ebaby_babylon_hodl.user_address, 
                ebaby_ethereum_hodl.user_address,
                eth_lp_agg.user_address
            ) = evm_union_lp_agg.user_address

        FULL OUTER JOIN eu_ethereum_user_point_hodl eu_ethereum_hodl
            ON COALESCE(
                baby_lp_agg.user_address,
                ebaby_babylon_hodl.user_address,
                ebaby_ethereum_hodl.user_address,
                eth_lp_agg.user_address,
                evm_union_lp_agg.user_address
            ) = eu_ethereum_hodl.user_address

        FULL OUTER JOIN user_point_extra extra
            ON COALESCE(
                baby_lp_agg.user_address,
                ebaby_babylon_hodl.user_address,
                ebaby_ethereum_hodl.user_address,
                eth_lp_agg.user_address,
                evm_union_lp_agg.user_address,
                eu_ethereum_hodl.user_address
            ) = extra.user_address
    `;

    if (!address) {
        // Leaderboard
        resultQuery = await client.query(`
            ${mainQuery}
            ORDER BY total_points DESC
            LIMIT 10;
        `, [poolAddresses.babylon, poolAddresses.ethereum]);
    } else {
        // Specific user
        resultQuery = await client.query(`
            WITH ranked_users AS (
                ${mainQuery}
            )
            SELECT *
            FROM ranked_users
            WHERE user_address = $3;
        `, [poolAddresses.babylon, poolAddresses.ethereum, address]);
    }

    return resultQuery;
}

async function cosmosPoints(client: PoolClient, address: string | null, poolAddresses: PoolAddresses) {
    let resultQuery;
    const mainQuery = `
        SELECT
            ROW_NUMBER() OVER (ORDER BY (COALESCE(baby_lp_agg.total_defi_lp, 0) + COALESCE(ebaby_babylon_hodl.total_hodl, 0)) DESC) AS rank,
            COALESCE(baby_lp_agg.user_address, ebaby_babylon_hodl.user_address) as user_address,
            COALESCE(ebaby_babylon_hodl.total_hodl, 0) as hodl_points,
            COALESCE(baby_lp_agg.total_defi_lp, 0) as lp_points,
            COALESCE(baby_lp_agg.total_defi_lp, 0) + COALESCE(ebaby_babylon_hodl.total_hodl, 0) as total_points
        FROM (
            SELECT
                user_address,
                SUM(total_defi_lp) as total_defi_lp
            FROM
                babylon_user_point_defi_lp
            where
                lp_address = ANY($1)
            group by
                user_address
        ) baby_lp_agg
        FULL OUTER JOIN babylon_user_point_hodl ebaby_babylon_hodl
            ON
            baby_lp_agg.user_address = ebaby_babylon_hodl.user_address
    `;
    if (!address) {
        resultQuery = await client.query(`
                ${mainQuery}
                ORDER BY
                    total_points desc
                limit 10;
            `, [poolAddresses.babylon]);
    } else {
        resultQuery = await client.query(`
                WITH ranked_users AS (
                    ${mainQuery}
                )
                SELECT *
                FROM ranked_users
                WHERE user_address = $2;
            `, [poolAddresses.babylon, address]);
    }

    return resultQuery;
}

async function evmPoints(client: PoolClient, address: string | null, poolAddresses: PoolAddresses) {
    const mainQuery = `
        SELECT
            ROW_NUMBER() OVER (
                ORDER BY (
                    COALESCE(evm_lp_agg.total_defi_lp, 0) +
                    COALESCE(evm_union_lp_agg.total_defi_lp, 0) +
                    COALESCE(ebaby_ethereum_hodl.total_hodl, 0) +
                    COALESCE(eu_ethereum_hodl.total_hodl, 0)
                ) DESC
            ) AS rank,

            COALESCE(
                evm_lp_agg.user_address,
                evm_union_lp_agg.user_address,
                ebaby_ethereum_hodl.user_address,
                eu_ethereum_hodl.user_address
            ) AS user_address,

            (
                COALESCE(ebaby_ethereum_hodl.total_hodl, 0) +
                COALESCE(eu_ethereum_hodl.total_hodl, 0)
            ) AS hodl_points,

            (
                COALESCE(evm_lp_agg.total_defi_lp, 0) +
                COALESCE(evm_union_lp_agg.total_defi_lp, 0)
            ) AS lp_points,

            (
                COALESCE(evm_lp_agg.total_defi_lp, 0) +
                COALESCE(evm_union_lp_agg.total_defi_lp, 0) +
                COALESCE(ebaby_ethereum_hodl.total_hodl, 0) +
                COALESCE(eu_ethereum_hodl.total_hodl, 0)
            ) AS total_points

        FROM (
            SELECT
                user_address,
                SUM(total_defi_lp) AS total_defi_lp
            FROM
                ethereum_user_point_defi_lp
            WHERE
                lp_address = ANY($1)
            GROUP BY
                user_address
        ) evm_lp_agg

        FULL OUTER JOIN (
            SELECT
                user_address,
                SUM(total_defi_lp) AS total_defi_lp
            FROM
                eu_ethereum_user_point_defi_lp
            WHERE
                lp_address = ANY($1)
            GROUP BY
                user_address
        ) evm_union_lp_agg
            ON evm_lp_agg.user_address = evm_union_lp_agg.user_address

        FULL OUTER JOIN ethereum_user_point_hodl ebaby_ethereum_hodl
            ON COALESCE(evm_lp_agg.user_address, evm_union_lp_agg.user_address ) = ebaby_ethereum_hodl.user_address

        FULL OUTER JOIN eu_ethereum_user_point_hodl eu_ethereum_hodl
            ON COALESCE(evm_lp_agg.user_address, evm_union_lp_agg.user_address, ebaby_ethereum_hodl.user_address) = eu_ethereum_hodl.user_address
    `;

    if (!address) {
        // Leaderboard query
        return client.query(`
            WITH ranked_users AS (
                ${mainQuery}
            )
            SELECT *
            FROM ranked_users
            WHERE total_points > 0
            ORDER BY total_points DESC
            LIMIT 10;
        `, [poolAddresses.ethereum]);
    }

    // Specific user query
    return client.query(`
        WITH ranked_users AS (
            ${mainQuery}
        )
        SELECT *
        FROM ranked_users
        WHERE user_address = $2;
    `, [poolAddresses.ethereum, address]);
}

export async function GET(req: Request) {
    try {
        // Temp
        const poolAddresses = {
            babylon: [
                "bbn1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgeslpzjvl",
                "bbn1jwd3e9smv9n7p20fud8ll9erz6ave95hn7e4w25sv9n450tpg3vqsqeg3d"
            ],
            ethereum: [
                "0xd4c29179bcf2a835d404dabbbe71880010e50ce0",
                "0xb759f938814c8b7a24344d75fa3fa4add89bdad2",
                "0xc58e9e692352cccba57c66a3585a2384754dc5d6" // eU/U
            ]
        };
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const address = searchParams.get('address');

        const client = await pool.connect();

        let resultQuery;

        switch (type) {
            case "cosmos":
                resultQuery = await cosmosPoints(client, address, poolAddresses);
                break;

            case "evm":
                resultQuery = await evmPoints(client, address, poolAddresses);
                break;

            default:
                resultQuery = await allPoints(client, address, poolAddresses);
                break;
        }

        client.release();
        return NextResponse.json(resultQuery?.rows);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}