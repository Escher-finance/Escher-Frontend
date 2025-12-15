import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS } from "@/configs/union";
import { UnionUnbond } from "@/types/trace";
import { useQuery } from "@tanstack/react-query";

/*
   query SearchUnbond {
    v2_unbonds(
    args: {p_transaction_hash: "0x14d2964f414bf92423c0e3a80d7be74ed7c696deb602e4d7e393108dd1c594b1"}
    ) {
    base_amount
    base_token
    packet_hash
    success
    traces {
        block_hash
        event_index
        height
        timestamp
        transaction_hash
        type
        universal_chain_id
    }
    }
    }
*/

export const getUnionUnbond = async (hash?: string) => {
    if (!hash) return undefined;

    const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query SearchUnbond {
                    v2_unbonds(
                        args: {p_transaction_hash: "${hash}"}
                    ) {
                        packet_hash
                        success
                        base_amount
                        base_token
                        sender_display
                        traces {
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

    const result = responseJson.data.v2_unbonds[0] as UnionUnbond | undefined;
    return result;
};

export const useUnionTraceUnbond = (hash?: string) => {
    return useQuery({
        queryKey: ['unionUnbond', hash],
        queryFn: () => getUnionUnbond(hash),
        enabled: !!hash,
        refetchInterval: APP_CONFIG.tracesRefetchInterval,
    });
};