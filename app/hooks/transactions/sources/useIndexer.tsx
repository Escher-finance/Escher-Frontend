import { APP_CONFIG } from "@/configs/app";
import { IndexerTransaction } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";
import { getUnionRecvBySends, UnionSendRecv } from "../../unionIndexer/extra";
import { getUnionMultiplePacketStatus } from "@/hooks/unionIndexer/packet";
import { safeHex } from "@/lib/utils";

interface Params {
    addresses: {
        mainnet: string | undefined;
        babylon: string | undefined;
        osmosis: string | undefined;
    }
    timestampTransaction: number
}

export default function useIndexer(params: Params) {
    async function getIndexer(): Promise<IndexerTransaction[]> {
        const query = [
            // DEBUG
            // Comment to disable query per address
            params.addresses.babylon ? `cosmos=${params.addresses.babylon}` : null,
            params.addresses.mainnet ? `evm=${params.addresses.mainnet}` : null,
            params.addresses.osmosis ? `osmosis=${params.addresses.osmosis}` : null,
        ]
            .filter(Boolean)
            .join('&');

        // Indexer
        const response = await fetch(`/api/transactions?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        let result = (await response.json()) as IndexerTransaction[];

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        // DEBUG
        // Uncomment to hide indexer tx
        // result = [];

        // Local
        const localData = localStorage.getItem(APP_CONFIG.dbTransaction);
        // DEBUG
        // set false to hide local
        // if (false) {
        if (localData) {
            const localTrxs = (JSON.parse(localData) as IndexerTransaction[]);

            // Compare local with indexer
            try {
                const indexerHashes = result.map((v: IndexerTransaction) => v.hash) as string[];

                const hashes = localTrxs.filter(v => v.channelId === 3).map(v => v.hash);
                let unionSendHashes: UnionSendRecv[] | undefined = undefined;
                try {
                    if (hashes && params.addresses.mainnet) {
                        unionSendHashes = await getUnionRecvBySends(params.addresses.mainnet, hashes);
                    }
                } catch {
                    // console.error(error);
                }

                const staleTrx: IndexerTransaction[] = [];
                localTrxs
                    .filter(v => ["bond", "unbond", "towerRemove", "towerAdd"].includes(v.action))
                    .map((v: IndexerTransaction) => {
                        const recvHash = unionSendHashes?.find(ush => ush.packet_send_transaction_hash === v.hash)?.packet_recv_transaction_hash;

                        const isUser = v.userAddress === params.addresses.babylon || v.userAddress === params.addresses.mainnet || v.userAddress === params.addresses.osmosis;
                        const isHashMissing = !indexerHashes.includes(v.hash);
                        const isRecvHashMissing = recvHash && !indexerHashes.includes(recvHash);

                        if (isUser && isHashMissing && (!recvHash || isRecvHashMissing)) {
                            staleTrx.push(v);
                        }
                    });

                result = [
                    ...[
                        ...staleTrx,
                        ...result
                    ]
                ].sort((x, y) => x.time < y.time ? 1 : -1);

            } catch (error) {
                console.error(error);
            }

            // check each local pending trx, if hash found in union's packet, update it's status
            const localPendingHashes = result
                .filter(v =>
                    v.status === "pending" &&
                    ["bond", "unbond"].includes(v.action)
                )
                .map(v => safeHex(v.hash));

            const unionMultiPcktStatus = (await getUnionMultiplePacketStatus(localPendingHashes))
                .filter(v => v.success === true)
                .map(v => v.packet_send_transaction_hash);

            // Update result
            result = result.filter(v => {
                if (v.source === "local" && unionMultiPcktStatus.includes(v.hash)) {
                    return false;
                }
                return true;
            });

            // Update localstorage
            const newLocal = localTrxs.filter(v => {
                if (unionMultiPcktStatus.includes(v.hash)) {
                    return false;
                }
                return true;
            });
            localStorage.removeItem(APP_CONFIG.dbTransaction);
            localStorage.setItem(APP_CONFIG.dbTransaction, JSON.stringify(newLocal));
        }
        return result;
    }

    return useQuery({
        queryKey: ["transactions", "indexer", params.addresses, params.timestampTransaction],
        queryFn: getIndexer,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        refetchOnWindowFocus: true
    });
}

/* old fun that compare local tx with union
async function getIndexer(): Promise<IndexerTransaction[]> {
        const query = [
            // DEBUG
            // Comment to disable query per address
            params.addresses.babylon ? `cosmos=${params.addresses.babylon}` : null,
            params.addresses.mainnet ? `evm=${params.addresses.mainnet}` : null,
            params.addresses.osmosis ? `osmosis=${params.addresses.osmosis}` : null,
        ]
            .filter(Boolean)
            .join('&');

        // Indexer
        const response = await fetch(`/api/transactions?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Failed to fetch data');
        }

        // DEBUG
        // Uncomment to hide indexer tx
        // result = [];

        // Local
        try {
            const indexerHashes = result.map((v: IndexerTransaction) => v.hash) as string[];
            const localData = localStorage.getItem(APP_CONFIG.dbTransaction);

            // DEBUG
            // set false to hide local
            // if (false) {
            if (localData) {
                const localTrxs = (JSON.parse(localData) as IndexerTransaction[]);
                const hashes = localTrxs.filter(v => v.channelId === 3).map(v => v.hash);
                let unionSendHashes: UnionSendRecv[] | undefined = undefined;
                try {
                    if (hashes && params.addresses.mainnet) {
                        unionSendHashes = await getUnionRecvBySends(params.addresses.mainnet, hashes);
                    }
                } catch {
                    // console.error(error);
                }

                const staleTrx: IndexerTransaction[] = [];
                localTrxs
                    .filter(v => ["bond", "unbond", "towerRemove", "towerAdd"].includes(v.action))
                    .map((v: IndexerTransaction) => {
                        const recvHash = unionSendHashes?.find(ush => ush.packet_send_transaction_hash === v.hash)?.packet_recv_transaction_hash;

                        const isUser = v.userAddress === params.addresses.babylon || v.userAddress === params.addresses.mainnet || v.userAddress === params.addresses.osmosis;
                        const isHashMissing = !indexerHashes.includes(v.hash);
                        const isRecvHashMissing = recvHash && !indexerHashes.includes(recvHash);

                        if (isUser && isHashMissing && (!recvHash || isRecvHashMissing)) {
                            staleTrx.push(v);
                        }
                    });

                return [
                    ...[
                        ...staleTrx,
                        ...result
                    ]
                ].sort((x, y) => x.time < y.time ? 1 : -1);
            }
        } catch (error) {
            console.error(error);
        }

        return result;
    }
     */