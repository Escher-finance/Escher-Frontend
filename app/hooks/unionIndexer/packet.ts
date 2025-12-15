import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS } from "@/configs/union";
import { UnionPacketSuccess, UnionTransfer } from "@/types/trace";
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


const getUnionPackets = async (hash: string | undefined) => {
    if (!hash) throw "No hash";

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
                    v2_packets(
                        args: {p_transaction_hash: "${formattedHash}"}
                    ) {
                        packet_hash
                        success
                        status
                        packet_send_transaction_hash
                        packet_send_timestamp
                        packet_recv_timestamp
                        packet_recv_transaction_hash
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

    const result = responseJson.data.v2_packets as UnionTransfer[];
    if (!result) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }
    return result;
};

export const getUnionPacket = async (hash: string | undefined) => {
    if (!hash) throw "No hash";

    const packets = await getUnionPackets(hash);
    return packets.at(0);
};

export const useUnionPacket = (hash: string | undefined) => {
    return useQuery({
        queryKey: ['unionPacket', hash],
        queryFn: () => getUnionPacket(hash),
        enabled: !!hash,
        refetchInterval: APP_CONFIG.tracesRefetchInterval,
    });
};

export const getUnionPacketStatus = async (hash: string) => {
    const result = {
        hash,
        send: false,
        recv: false
    }
    try {
        const sendPacket = await getUnionPacket(hash);
        result.send = sendPacket?.success ?? false;

        if (sendPacket?.packet_recv_transaction_hash) {
            const recvPackets = await getUnionPackets(sendPacket.packet_recv_transaction_hash);
            const recvPacket = recvPackets.find(v => v.packet_send_transaction_hash === sendPacket.packet_recv_transaction_hash);
            result.recv = recvPacket?.success ?? false;
        }

    } catch (error) {
        console.error(error);
    }

    return result;
}

export const getUnionMultiplePacketStatus = async (hashes: string[]) => {
    if (hashes.length === 0) return []

    const queries = hashes.map((hash, i) => `
        tx${i}: v2_packets(args: { p_transaction_hash: "${hash}" }) {
          packet_send_transaction_hash
          success
        }
      `
    ).join('\n')

    const query = `
        query SearchMultiplePacketStatus {
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