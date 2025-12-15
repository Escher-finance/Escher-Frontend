import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const poolId = searchParams.get("poolId");
        const baseCoinMinimalDenom = searchParams.get("baseCoinMinimalDenom");
        const quoteCoinMinimalDenom = searchParams.get("quoteCoinMinimalDenom");
        const timeDuration = searchParams.get("timeDuration");
        if (!poolId || !baseCoinMinimalDenom || !quoteCoinMinimalDenom || !timeDuration) {
            throw new Error("Bad arguments")
        }
        const data = encodeURIComponent(JSON.stringify({ json: { poolId, baseCoinMinimalDenom, quoteCoinMinimalDenom, timeDuration } }));
        const response = await fetch(`https://app.osmosis.zone/api/edge-trpc-assets/assets.getAssetPairHistoricalPrice?input=${data}`);
        const jsonResponse = await response.json();
        if (!response.ok) {
            throw new Error(jsonResponse.errors?.[0]?.message || 'Failed to fetch data');
        }
        const min = jsonResponse.result?.data?.json?.min;
        const max = jsonResponse.result?.data?.json?.max;
        if (!min || !max) {
            throw new Error("Invalid data returned from call");
        }

        return NextResponse.json({ result: { min, max } });
    } catch (error) {
        console.error('Error fetching historical prices:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
