import { Buffer } from 'buffer';
import https from 'https';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Contract
        const contract = 'union1d2r4ecsuap4pujrlf3nz09vz8eha8y0z25knq0lfxz4yzn83v6kq0jxsmk';

        const delegator = searchParams.get('delegator');

        // Prefer LCD for compatibility; default to mainnet REST endpoint
        const lcdUrls = {
            mainnet: 'https://rest.union.build',
            testnet: 'https://rest.rpc-node.union-testnet-10.union.build',
        }
        const lcd = searchParams.get('testnet') ? lcdUrls.testnet : lcdUrls.mainnet;

        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });
        const abortController = new AbortController();

        const contractData = await getContractData({
            abortController,
            contract,
            debug: searchParams.get('test') === '1',
            httpsAgent,
            lcd
        });

        return NextResponse.json({ contract, contractData });
    } catch (error) {
        console.error('Union accounting_state query error:', error);
        return NextResponse.json({
            error: String((error as Error)?.message || error), name: (error as Error)?.name, url: undefined
        }, { status: 500 });
    }
}

const getContractData = async ({ lcd, contract, debug, httpsAgent, abortController }:
    {
        lcd: string
        contract: string
        debug: boolean
        httpsAgent: https.Agent
        abortController: AbortController
    }
) => {

    const query = { accounting_state: {} } as const;
    const encoded = Buffer.from(JSON.stringify(query)).toString('base64');
    const url = `${lcd.replace(/\/$/, '')}/cosmwasm/wasm/v1/contract/${contract}/smart/${encoded}`;

    // Optional: return constructed URL for debugging
    if (debug) {
        return { contract, lcd, url };
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    const json = await response.json();

    if (!response.ok) {
        return { error: json, url };
    }

    // Debug logging to understand response structure
    if (debug) {
        console.log('Union API response structure:', JSON.stringify(json, null, 2));
    }

    // LCD returns base64-encoded bytes under `data`
    const jsonData = json as { data?: string; smart_contract_state?: { data: string } };
    const base64Data = jsonData?.data || jsonData?.smart_contract_state?.data;
    let result = json;

    // Only try to decode if we have a valid base64 string
    if (base64Data && typeof base64Data === 'string' && base64Data.length > 0) {
        try {
            // Validate that it's actually base64
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (base64Regex.test(base64Data)) {
                const decoded = Buffer.from(base64Data, 'base64').toString('utf8');
                result = JSON.parse(decoded);
            } else {
                console.log('Union API: base64Data is not valid base64, using raw data');
                result = base64Data;
            }
        } catch (error) {
            console.error('Union API error:', error);
            result = base64Data;
        }
    } else {
        console.log('Union API: No valid base64 data found, using raw response');
    }
    return result;
}