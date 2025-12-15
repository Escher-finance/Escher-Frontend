import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;
        if (!address) {
            throw "Invalid address";
        }

        const API_URL = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=eth`;
        const API_KEY = process.env.MORALIS_API_KEY!;

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch balance data: ${response.statusText}`);
        }

        const result = await response.json();
        return NextResponse.json(result.result);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', message: String(error) }, { status: 500 });
    }
}