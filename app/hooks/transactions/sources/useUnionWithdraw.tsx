import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { getTokensByNetwork } from "@/lib/utils";
import { IndexerTransaction } from "@/types/transaction";
import { UnionIndexerWithdraw } from "@/types/union";
import { useQuery } from "@tanstack/react-query";

const TOKENS = getTokensByNetwork();

interface Params {
    addresses: {
        mainnet: string | undefined;
        babylon: string | undefined;
        osmosis: string | undefined;
    }
    timestampTransaction: number
}

export default function useUnionWithdraw(params: Params) {
    async function getData(): Promise<IndexerTransaction[]> {
        const address = params.addresses.mainnet;

        if (!address) return [];

        const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query SearchWithdrawByAddress {
                        v2_withdraws(
                            args: {p_addresses_canonical: ["${address}"]}
                        ){
                            batches
                            delivery_success
                            quote_amount
                            quote_token
                            receiver_display
                            source_universal_chain_id
                            withdraw_send_timestamp
                            withdraw_send_transaction_hash
                        }
                    }
                `,
            }),
        });
        const responseJson = await response.json();
        const responseWithdraw = responseJson.data.v2_withdraws as UnionIndexerWithdraw[];

        const result: IndexerTransaction[] = [];

        // map bond result
        responseWithdraw.map(v => {
            const tokenA = getUnionIndexerToken({ universalChainId: v.source_universal_chain_id, address: v.quote_token });

            result.push({
                action: "withdraw",
                amountA: v.quote_amount,
                channelId: 0,
                denomA: v.quote_token,
                hash: v.withdraw_send_transaction_hash,
                lst: "union",
                recipient: v.receiver_display,
                recipientChannelId: null,
                source: "union",
                status: (v.delivery_success === true) ? "success" : "pending",
                time: v.withdraw_send_timestamp,
                tokenIdA: tokenA?.id,
                userAddress: v.receiver_display,
            });
        })

        return result;
    }

    const getUnionIndexerToken = (params: { universalChainId: string, address: string }) => {
        let chainId: string | number | undefined;
        switch (params.universalChainId) {
            case "ethereum.1": chainId = CHAINS.mainnet.id; break;
            case "ethereum.17000": chainId = CHAINS.holesky.id; break;
        }

        if (!chainId) return undefined;

        return TOKENS.find(t => t.chain.id === chainId && t.contractAddress === params.address);
    }

    return useQuery({
        queryKey: ["transactions", "withdraw", params.addresses.mainnet, params.timestampTransaction],
        queryFn: getData,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        refetchOnWindowFocus: true,
    });
}