import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS } from "@/configs/union";
import { UnionDust, UnionDustStatus, UnionPacketSuccess, UnionWithdrawStatus } from "@/types/trace";
import { useQuery } from "@tanstack/react-query";

/*
   query SearchDustByTx {
        v2_dust_withdraws(
            args: {p_transaction_hash: "0x1599eee430321751d336493b6f61c4ab45d9cd5fc4d9f99a377aa6ac91de59de"}
        ){
            packet_hash
            delivery_success
            dust_withdraw_send_transaction_hash
            dust_withdraw_success
            dust_withdraw_traces {
                timestamp
                transaction_hash
                type
                universal_chain_id
            }
            delivery_traces{
                timestamp
                transaction_hash
                type
                universal_chain_id
            }
        }
    }
*/

const getUnionDustByTx = async (hash?: string) => {
    if (!hash) return undefined;

    const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query SearchDustByTx {
                    v2_dust_withdraws(
                        args: {p_transaction_hash: "${hash}"}
                    ) {
                        packet_hash
                        delivery_success
                        dust_withdraw_success
                        quote_amount
                        quote_token
                        dust_withdraw_traces {
                            timestamp
                            transaction_hash
                            type
                            universal_chain_id
                        }
                        delivery_traces{
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

    const result = responseJson.data.v2_dust_withdraws[0] as UnionDust | undefined;
    return result;
};

export const useUnionTraceDust = (hash?: string) => {
    return useQuery({
        queryKey: ['unionDust', hash],
        queryFn: () => getUnionDustByTx(hash),
        enabled: !!hash,
        refetchInterval: APP_CONFIG.tracesRefetchInterval,
    });
};

export const getUnionDustStatus = async (hashes: string[]) => {
    if (hashes.length === 0) return []

    const queries = hashes.map((hash, i) => `
        tx${i}: v2_packets(args: { p_transaction_hash: "${hash}" }) {
          packet_send_transaction_hash
          success
        }
      `
    ).join('\n')

    const query = `
        query SearchDustStatus {
        ${queries}
        }
    `;

    const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    })

    const responseJson = await response.json()

    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data')
    }

    const data = responseJson.data
    if (!data) return [];

    const result: UnionPacketSuccess[] = Object.keys(data).map(key => ({
        packet_send_transaction_hash: data[key]?.[0]?.packet_send_transaction_hash,
        success: data[key]?.[0]?.success ?? false,
    }))

    return result
};

export const getUnionDustStatusByAddress = async (address: string) => {

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
                        quote_amount
                        quote_token
                    }
                }
            `
        })
    })

    const responseJson = await response.json()

    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data')
    }

    return responseJson.data.v2_dust_withdraws as UnionDustStatus[] | undefined;
};

export const getUnionWithdrawByAddress = async (address: string) => {

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
                        withdraw_success
                        delivery_success
                    }
                }
            `
        })
    })

    const responseJson = await response.json()

    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data')
    }

    return responseJson.data.v2_withdraws as UnionWithdrawStatus[] | undefined;
};