import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lcd = searchParams.get('testnet')
      ? 'https://rest.rpc-node.union-testnet-10.union.build'
      : 'https://rest.union.build';

    // default delegator used for Union TVL aggregation
    const delegator = searchParams.get('delegator')
      || 'union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v';

    const res = await fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`);
    if (!res.ok) {
      const detail = await safeJson(res);
      return NextResponse.json({ error: 'delegations_failed', detail }, { status: 502 });
    }
    const json = await res.json() as { delegation_responses?: Array<{ balance?: { amount?: string } }> };
    const delegations = Array.isArray(json?.delegation_responses) ? json.delegation_responses : [];

    let tvlAtomic = 0; // 18-decimal atomic units
    for (const d of delegations) {
      tvlAtomic += Number(d?.balance?.amount || 0);
    }

    // Convert 18-decimal to whole token amount
    const tvlToken = tvlAtomic / 10 ** 18;

    // Fetch USD price from CoinGecko using id 'union-2' (public first, then Pro if available)
    let tvlUsd: number | null = null;
    const cgId = 'union-2';
    // Public first (no key)
    try {
      const pubRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cgId)}&vs_currencies=usd&precision=full`);
      if (pubRes.ok) {
        const priceJson = await pubRes.json() as { [k: string]: { usd?: number } };
        const price = priceJson?.[cgId]?.usd;
        if (typeof price === 'number' && Number.isFinite(price)) {
          tvlUsd = tvlToken * price;
        }
      }
    } catch {}

    // If still null, try Pro with key if present
    if (tvlUsd === null && process.env.COINGECKO_API_KEY) {
      try {
        const proRes = await fetch(`https://pro-api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cgId)}&vs_currencies=usd&precision=full`, {
          headers: { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY }
        });
        if (proRes.ok) {
          const priceJson = await proRes.json() as { [k: string]: { usd?: number } };
          const price = priceJson?.[cgId]?.usd;
          if (typeof price === 'number' && Number.isFinite(price)) {
            tvlUsd = tvlToken * price;
          }
        }
      } catch {}
    }

    return NextResponse.json({ tvlToken, tvlUsd });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return await res.text(); }
}


