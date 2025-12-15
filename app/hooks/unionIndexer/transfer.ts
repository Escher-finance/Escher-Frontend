import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS } from "@/configs/union";
import { UnionTransfer } from "@/types/trace";
import { useQuery } from "@tanstack/react-query";

/*
query MyQuery {
  v2_transfers(
    args: {p_transaction_hash: "0xd966673f2558d3b75d7e8ce2fa41a8cafd74fa6870d067898a392e5264bc79bd"}
  ) {
    packet_hash
    success
    transfer_send_transaction_hash
    transfer_send_timestamp
    transfer_recv_timestamp
    transfer_recv_transaction_hash
    traces {
        timestamp
        transaction_hash
        type
        universal_chain_id
    }
  }
}
*/

export const getUnionTransfer = async (hash: string) => {
    const formattedHash = hash.startsWith("0x")
        ? hash
        : `0x${hash.toLowerCase()}`;

    const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query MyQuery {
                    v2_transfers(
                        args: {p_transaction_hash: "${formattedHash}"}
                    ) {
                        packet_hash
                        success
                        transfer_send_transaction_hash
                        transfer_send_timestamp
                        transfer_recv_timestamp
                        transfer_recv_transaction_hash
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

    const result = responseJson.data.v2_transfers[0] as UnionTransfer;
    if (!result) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }
    return result;
};

export const useUnionTransfer = (hash: string) => {
    return useQuery({
        queryKey: ['unionTransfer', hash],
        queryFn: () => getUnionTransfer(hash),
        enabled: !!hash,
        refetchInterval: APP_CONFIG.tracesRefetchInterval,
    });
};