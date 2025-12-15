import { APP_CONFIG } from '@/configs/app';
import { UnionInstruction } from '@/types/trace';
import { useQuery } from '@tanstack/react-query';

const baseUrl = "https://graphql.union.build/v1/graphql";

const multiplexContractAddress = "0x62626e316d377a72356a77346b397a32327239616a676766347563616c7779377578767539676b7736746e736d7634326c766a706b7761736167656b3567";

/*
query MyQuery {
  v2_instructions(
    args: {
      p_multiplex_contract_address: "0x62626e316d377a72356a77346b397a32327239616a676766347563616c7779377578767539676b7736746e736d7634326c766a706b7761736167656b3567", 
      p_transaction_hash: "0xc06641b45e5c0683e0a4c089e845493cb189f75ffba9cccfdb75f6ca5ef6c6e1"
    }
  ) {
    packet_hash
    success
    status
    packet_send_timestamp
    packet_send_transaction_hash
    packet_recv_transaction_hash
    packet_recv_timestamp
  }
}
*/

export const getUnionInstruction = async (hash: string) => {
    const h = hash.startsWith("0x")
        ? hash
        : `0x${hash.toLowerCase()}`;
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query MyQuery {
                    v2_instructions(
                        args: {
                            p_transaction_hash:"${h}"
                        }
                    ) {
                        packet_hash
                        success
                        status
                        packet_send_timestamp
                        packet_send_transaction_hash
                        packet_recv_transaction_hash
                        packet_recv_timestamp
                    }
                }
            `,
        }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }

    const result = responseJson.data.v2_instructions[0] as UnionInstruction;
    if (!result) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }
    return result;
};

export const useUnionInstruction = (hash: string) => {
    return useQuery({
        queryKey: ['unionInstruction', hash],
        queryFn: () => getUnionInstruction(hash),
        enabled: !!hash,
        refetchInterval: APP_CONFIG.tracesRefetchInterval,
    });
};

export interface UnionSendRecv {
    packet_send_transaction_hash: string
    packet_recv_transaction_hash?: string
}

export const getUnionRecvBySends = async (userAddress: string, hashes: string[]) => {
    let formattedHashes = "[";
    hashes.map(v => {
        formattedHashes += `"${v}",`
    });
    formattedHashes += "]"

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query MyQuery {
                    v2_instructions(
                        args: {
                            p_multiplex_contract_address: "${multiplexContractAddress}", 
                            p_multiplex_sender: "${userAddress}", 
                            p_limit: 100
                        }
                        where: {
                            packet_send_transaction_hash: {_in: ${formattedHashes}}
                        }
                    ) {
                        packet_send_transaction_hash
                        packet_recv_transaction_hash
                    }
                }
            `,
        }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }

    const result = responseJson.data.v2_instructions as UnionSendRecv[]
    return result.map(v => ({
        packet_send_transaction_hash: v.packet_send_transaction_hash,
        packet_recv_transaction_hash: v.packet_recv_transaction_hash ? v.packet_recv_transaction_hash.slice(2, v.packet_recv_transaction_hash.length).toUpperCase() : undefined
    }));
};