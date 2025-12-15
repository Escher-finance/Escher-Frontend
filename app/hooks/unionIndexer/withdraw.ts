import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS } from "@/configs/union";
import { UnionWithdraw } from "@/types/trace";
import { useQuery } from "@tanstack/react-query";

/*
  query MyQuery {
  v2_withdraws(
    args: {p_transaction_hash: "0x3557ca997eead85208f4fd4de5f0aaab3763d37f71960bef47ed5203bba11569"}
  ) {
    packet_hash
    delivery_success
    quote_amount
    quote_token
    withdraw_success
    withdraw_traces {
      timestamp
      transaction_hash
      type
      universal_chain_id
    }
    delivery_traces {
      timestamp
      transaction_hash
      type
      universal_chain_id
    }
  }
}

*/

const getUnionWithdrawByTx = async (hash?: string) => {
    if (!hash) return undefined;

    const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query SearchWithdrawByTx {
                    v2_withdraws(
                        args: {p_transaction_hash: "${hash}"}
                    ) {
                        delivery_success
                        packet_hash
                        quote_amount
                        quote_token
                        withdraw_success
                        delivery_traces {
                            timestamp
                            transaction_hash
                            type
                            universal_chain_id
                        }
                        withdraw_traces {
                            timestamp
                            transaction_hash
                            type
                            universal_chain_id
                        }
                    }
                }
            `,
        }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }

    const result = responseJson.data.v2_withdraws[0] as UnionWithdraw | undefined;
    return result;
};

export const useUnionTraceWithdraw = (hash?: string) => {
    return useQuery({
        queryKey: ['unionWithdraw', hash],
        queryFn: () => getUnionWithdrawByTx(hash),
        enabled: !!hash,
        refetchInterval: APP_CONFIG.tracesRefetchInterval,
    });
};