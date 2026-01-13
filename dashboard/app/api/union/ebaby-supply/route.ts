import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lcd = searchParams.get('testnet')
      ? 'https://rest.rpc-node.union-testnet-10.union.build'
      : 'https://rest.union.build';

    const res = await fetch(`${lcd}/cosmos/bank/v1beta1/supply`);
    if (!res.ok) {
      const detail = await safeJson(res);
      return NextResponse.json({ error: 'supply_failed', detail }, { status: 502 });
    }
    const json = await res.json() as { supply?: Array<{ denom?: string; amount?: string }> };
    const amount = Number((json?.supply || [])[0]?.amount || 0);
    // Union token uses 18 decimals
    const totalSupplyToken = amount / 10 ** 18;
    return NextResponse.json({ totalSupplyToken });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return await res.text(); }
}


