import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/babylon/market_chart?vs_currency=usd&days=7`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-cg-demo-api-key': 'CG-m5Ma54E3U8ELwVuRr2Wj3u91',
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Failed to fetch data');
        }

        return NextResponse.json({ result });
    } catch (error) {
        console.error('Coingecko error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}