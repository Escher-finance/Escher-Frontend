import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const poolId = searchParams.get("poolId");
        if (!poolId) {
            throw new Error("Invalid poolId");
        }

        const data = encodeURIComponent(JSON.stringify({ json: { poolId } }));
        const response = await fetch(`https://app.osmosis.zone/api/edge-trpc-pools/pools.getPool?input=${data}`);
        const jsonResponse = await response.json();

        const responseIn = await fetch(`https://app.osmosis.zone/api/edge-trpc-pools/pools.getPoolIncentives?input=${data}`);
        const jsonResponseIn = await responseIn.json();
        const aprUpper = JSON.parse(jsonResponseIn.result?.data?.json?.aprBreakdown?.total?.upper).rate as string;
        const aprLower = JSON.parse(jsonResponseIn.result?.data?.json?.aprBreakdown?.total?.lower).rate as string;

        return NextResponse.json({
            id: jsonResponse.result?.data?.json?.id,
            market: {
                volume24hUsd: JSON.parse(jsonResponse.result?.data?.json?.market?.volume24hUsd),
                volume7dUsd: JSON.parse(jsonResponse.result?.data?.json?.market?.volume24hUsd),
            },
            apr: {
                upper: aprUpper,
                lower: aprLower,
                value: Number(aprUpper)
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', message: error?.toString() }, { status: 500 });
    }
}
