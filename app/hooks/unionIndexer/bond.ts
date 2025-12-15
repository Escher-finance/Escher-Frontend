import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS } from "@/configs/union";
import { UnionBond } from "@/types/trace";
import { useQuery } from "@tanstack/react-query";

/*
    query SearchBonds {
    v2_bonds(
        args: {p_transaction_hash: "0x2f2531db3859238ea55ae79dc800a1ff7d6299836afd4e46b2956a63a06a3219"}
    ) {
        packet_hash
        bond_success
        delivery_success
        sender_display
        base_amount
        base_token
        quote_amount
        quote_token
        receiver_display
        bond_traces {
        timestamp
        transaction_hash
        type
        universal_chain_id
        }
        delivery_traces {
        universal_chain_id
        transaction_hash
        type
        timestamp
        }
    }
    }
*/

export const getUnionBond = async (hash?: string) => {
    if (!hash) return undefined;

    const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query SearchBonds {
                    v2_bonds(
                        args: {p_transaction_hash: "${hash}"}
                    ) {
                        packet_hash
                        bond_success
                        delivery_success
                        sender_display
                        base_amount
                        base_token
                        quote_amount
                        quote_token
                        receiver_display
                        bond_traces {
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
            `,
        }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }

    const result = responseJson.data.v2_bonds[0] as UnionBond | undefined;
    return result;
};

export const useUnionTraceBond = (hash?: string) => {
    return useQuery({
        queryKey: ['unionBond', hash],
        queryFn: () => getUnionBond(hash),
        enabled: !!hash,
        refetchInterval: APP_CONFIG.tracesRefetchInterval,
    });
};