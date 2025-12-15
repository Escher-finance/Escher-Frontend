import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { getTokensByNetwork } from "@/lib/utils";
import { LiquidStaking } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import { UnionIndexerDust } from "@/types/union";
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

export default function useUnionDust(params: Params) {
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
                    query SearchDustStatusByAddress {
                        v2_dust_withdraws(
                            args: {p_addresses_canonical: ["${address}"]}
                        ){
                            delivery_success
                            dust_withdraw_send_timestamp
                            dust_withdraw_send_transaction_hash
                            dust_withdraw_success
                            quote_amount
                            quote_token
                            receiver_display
                            source_universal_chain_id
                            remote_universal_chain_id
                        }
                    }
                `,
            }),
        });
        const responseJson = await response.json();
        const responseDust = responseJson.data.v2_dust_withdraws as UnionIndexerDust[];

        const result: IndexerTransaction[] = [];

        // map bond result
        responseDust.map(v => {
            const tokenA = getUnionIndexerToken({ universalChainId: v.source_universal_chain_id, address: v.quote_token });

            let lst: LiquidStaking = "union";
            switch (v.remote_universal_chain_id) {
                case "union.union-1":
                    lst = "union";
                    break;
                case "babylon.bbn-1":
                    lst = "babylon";
                    break;
            }

            result.push({
                action: "dust",
                amountA: v.quote_amount,
                channelId: 0,
                denomA: v.quote_token,
                hash: v.dust_withdraw_send_transaction_hash,
                lst,
                recipient: v.receiver_display,
                recipientChannelId: null,
                source: "union",
                status: (v.delivery_success === true) ? "success" : "pending",
                time: v.dust_withdraw_send_timestamp,
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
        queryKey: ["transactions", "dust", "union", params.addresses.mainnet, params.timestampTransaction],
        queryFn: getData,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        refetchOnWindowFocus: true,
    });
}