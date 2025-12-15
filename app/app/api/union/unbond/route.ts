import { getUnionBondUnbond } from '@/lib/union';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const isTestnet = searchParams.get('testnet') ? true : false;

        const result = await getUnionBondUnbond({
            type: 'bond',
            isTestnet: isTestnet
        });

        return NextResponse.json(result.filter((v: { type: string }) => v.type === 'unbond'));
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, name: error.name, url: undefined },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: String(error), name: undefined, url: undefined },
            { status: 500 }
        )
    }
}