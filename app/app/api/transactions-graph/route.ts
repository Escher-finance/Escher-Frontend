import { APP_CONFIG } from '@/configs/app';
import { EU_TOKENS, U_TOKENS } from '@/configs/token';
import { formatDateOnlyUnix } from '@/lib/date';
import { IndexerTransaction } from '@/types/transaction';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
) {
    try {
        const { searchParams } = new URL(req.url);
        const evm = searchParams.get('evm')?.toLowerCase();

        if (!evm) {
            return NextResponse.json([]);
        }
        let result: IndexerTransaction[] = [];

        const response = await fetch(`https://api.studio.thegraph.com/query/112218/union-lst/version/latest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                query MyQuery {
                    hubStakes(where: {staker: "${evm}"}) {
                        id
                        staker
                        recipient
                        timestamp
                        transactionHash
                        mintAmount
                        stakeAmount
                        recipientChannelId
                        exchangeRate
                    }
                }

            `,
            }),
        });

        const resultQuery = (await response.json()).data.hubStakes as Array<{ transactionHash: string; staker: string; recipientChannelId: number; recipient: string; stakeAmount: string; mintAmount: string; exchangeRate: string; timestamp: string }>;

        const rowsBond: IndexerTransaction[] = resultQuery.map((v) => ({
            lst: "union",
            hash: v.transactionHash,
            action: "bond",
            userAddress: v.staker,
            channelId: 0,
            recipientChannelId: v.recipientChannelId,
            recipient: v.recipient,

            denomA: U_TOKENS.holesky.contractAddress!,
            amountA: v.stakeAmount,

            denomB: EU_TOKENS.holesky.contractAddress!,
            amountB: v.mintAmount,

            exchange_rate: v.exchangeRate,
            submitted: undefined,

            status: "success",
            time: formatDateOnlyUnix(Number(v.timestamp), APP_CONFIG.dateTimeFormat),
            source: "indexer"
        }));

        result = [...rowsBond];

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
