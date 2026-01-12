import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const lcd = searchParams.get('testnet')
      ? 'https://rest.rpc-node.union-testnet-10.union.build'
      : 'https://rest.union.build';

    // Fetch network data in parallel
    const [stakingResponse, inflationResponse, supplyResponse] = await Promise.all([
      fetch(`${lcd}/cosmos/staking/v1beta1/pool`),
      fetch(`${lcd}/cosmos/mint/v1beta1/inflation`),
      fetch(`${lcd}/cosmos/bank/v1beta1/supply`)
    ]);

    if (!stakingResponse.ok) {
      const err = await safeJson(stakingResponse);
      return NextResponse.json({ error: 'staking_pool_failed', detail: err }, { status: 502 });
    }
    if (!inflationResponse.ok) {
      const err = await safeJson(inflationResponse);
      return NextResponse.json({ error: 'inflation_failed', detail: err }, { status: 502 });
    }
    if (!supplyResponse.ok) {
      const err = await safeJson(supplyResponse);
      return NextResponse.json({ error: 'supply_failed', detail: err }, { status: 502 });
    }

    const stakingData = await stakingResponse.json() as { pool?: { bonded_tokens?: string } };
    const inflationData = await inflationResponse.json() as { inflation?: string };
    const supplyData = await supplyResponse.json() as { supply?: Array<{ denom?: string; amount?: string }> };

    const bondedTokens = Number(stakingData?.pool?.bonded_tokens || 0);
    const totalSupply = Number((supplyData?.supply || [])[0]?.amount || 0);
    const inflation = Number(inflationData?.inflation || 0);

    const ratio = totalSupply > 0 ? (bondedTokens / totalSupply) : 0;

    // Commission-weighted adjustment using provided validator set (weights sum to 1)
    // L5 12% 5%, Crypto crew 2% 5%, Block hunters 12% 5%, 01 node 14% 5%, Range 10% 5%, Cosmos spaces 25% 5%, Defi Dojo 25% 10%
    const validatorWeights: Array<{ weight: number; commission: number }> = [
      { weight: 0.12, commission: 0.05 },
      { weight: 0.02, commission: 0.05 },
      { weight: 0.12, commission: 0.05 },
      { weight: 0.14, commission: 0.05 },
      { weight: 0.10, commission: 0.05 },
      { weight: 0.25, commission: 0.05 },
      { weight: 0.25, commission: 0.10 },
    ];
    const c = validatorWeights.reduce((sum, v) => sum + (v.weight * v.commission), 0);

    // Final APR per spec: APR * 0.9 * (1 - c), where base APR = inflation / ratio
    const aprBase = ratio > 0 ? (inflation / ratio) : 0;
    const apr = aprBase * 0.9 * (1 - c);

    return NextResponse.json({ apr, ratio, inflation, c });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return await res.text(); }
}


