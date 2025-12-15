import { UniV3AprDataResponse } from "@/types/subgraph";
import { NextResponse } from "next/server";

interface PoolV3SubgraphResponse {
    data: {
        pool: {
            feeTier: string;
            poolDayData: {
                volumeToken0: string;
                volumeToken1: string;
            }[];
        };
    };
}

const THEGRAPH_UNISWAP_V3 =
    "https://thegraph.com/explorer/api/playground/QmTZ8ejXJxRo7vDBS4uwqBeGoxLSWbhaA7oXa1RvxunLy7";

export async function GET(
    req: Request,
): Promise<NextResponse<UniV3AprDataResponse>> {
    try {
        const { searchParams } = new URL(req.url);
        const pool = searchParams.get("pool")?.toLowerCase();

        if (!pool) {
            return NextResponse.json({
                data: null,
            });
        }

        const response = await fetch(THEGRAPH_UNISWAP_V3, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: `{"query":"{\\n  pool(id: \\"${pool}\\") {\\n    feeTier\\n\\t\\tpoolDayData(first: 365, orderBy: date, orderDirection:desc, where: {volumeToken1_gt: 0}) {\\n      volumeToken0\\n\\t\\t\\tvolumeToken1\\n    }\\n  }\\n}"}`,
        });

        const result: PoolV3SubgraphResponse = await response.json();

        const volumeCount = result.data.pool.poolDayData.length;

        if (volumeCount === 0) {
            return NextResponse.json({
                data: null,
            });
        }

        const poolDayData = result.data.pool.poolDayData.map(
            ({ volumeToken0, volumeToken1 }) => ({
                volumeToken0: Number(volumeToken0),
                volumeToken1: Number(volumeToken1),
            }),
        );

        const { sumVolume24hToken0, sumVolume24hToken1 } = poolDayData.reduce(
            (a, b) => {
                a.sumVolume24hToken0 += b.volumeToken0;
                a.sumVolume24hToken1 += b.volumeToken1;
                return a;
            },
            {
                sumVolume24hToken0: 0,
                sumVolume24hToken1: 0,
            },
        );

        const avgVolume24hToken0 = sumVolume24hToken0 / volumeCount;
        const avgVolume24hToken1 = sumVolume24hToken1 / volumeCount;

        const {
            volumeToken0: highestVolume24hToken0,
            volumeToken1: highestVolume24hToken1,
        } = poolDayData.reduce((a, b) => {
            if (
                b.volumeToken0 + b.volumeToken1 >
                a.volumeToken0 + a.volumeToken1
            ) {
                return b;
            }
            return a;
        }, poolDayData[0]);

        return NextResponse.json({
            data: {
                feeTier: Number(result.data.pool.feeTier),
                latestVolume24hToken0: poolDayData[0].volumeToken0,
                latestVolume24hToken1: poolDayData[0].volumeToken1,
                avgVolume24hToken0,
                avgVolume24hToken1,
                highestVolume24hToken0,
                highestVolume24hToken1,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error, data: null }, { status: 500 });
    }
}
