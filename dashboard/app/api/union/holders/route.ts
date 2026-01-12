import { NextResponse } from "next/server";

export async function GET() {
  try {
    const CONTRACT_ADDRESS = "0xe5Cf13C84c0fEa3236C101Bd7d743d30366E5CF1";
    const url = `https://etherscan.io/token/${CONTRACT_ADDRESS}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'etherscan_fetch_failed', status: res.status, detail: text.slice(0, 500) }, { status: 502 });
    }
    const html = await res.text();

    let match = html.match(/Holders:\s*(\d{1,3}(?:,\d{3})*)/i);
    if (!match) match = html.match(/"holders"\s*:\s*"?(\d{1,3}(?:,\d{3})*|\d+)"?/i);
    if (!match) return NextResponse.json({ error: 'holders_not_found' }, { status: 502 });

    const value = Number(String(match[1]).replace(/,/g, ''));
    if (!Number.isFinite(value)) return NextResponse.json({ error: 'invalid_holders_value' }, { status: 502 });

    return NextResponse.json({ unique_holders: value, source: 'etherscan_html' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Internal Server Error' }, { status: 500 });
  }
}


