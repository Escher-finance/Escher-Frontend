import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lcd = searchParams.get('testnet')
      ? 'https://rest.rpc-node.union-testnet-10.union.build'
      : 'https://rest.union.build';

    // default delegator used for Union TVL/staked aggregation
    const delegator = searchParams.get('delegator')
      || 'union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v';

    const res = await fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`);
    if (!res.ok) {
      const detail = await safeJson(res);
      return NextResponse.json({ error: 'delegations_failed', detail }, { status: 502 });
    }
    const json = await res.json() as { delegation_responses?: Array<{ balance?: { amount?: string } }> };
    const delegations = Array.isArray(json?.delegation_responses) ? json.delegation_responses : [];

    let totalAtomic = 0; // 18-decimal units
    for (const d of delegations) {
      totalAtomic += Number(d?.balance?.amount || 0);
    }

    const stakedToken = totalAtomic / 10 ** 18;
    return NextResponse.json({ stakedToken });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return await res.text(); }
}


