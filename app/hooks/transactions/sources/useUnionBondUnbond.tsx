import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { getTokensByNetwork } from "@/lib/utils";
import { IndexerTransaction } from "@/types/transaction";
import { UnionIndexerBond, UnionIndexerUnbond } from "@/types/union";
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

export default function useUnionBondUnbond(params: Params) {
    async function getUnion(): Promise<IndexerTransaction[]> {
        const address = params.addresses.mainnet;

        if (!address) return [];

        const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query SearchBonds {
                        v2_bonds(
                            args: {
                                p_addresses_canonical: ["${address}"],
                                p_source_universal_chain_id: "ethereum.1"
                            }
                        ) {
                            base_amount
                            base_token
                            bond_send_timestamp
                            bond_send_transaction_hash
                            bond_success
                            delivery_success
                            destination_universal_chain_id
                            packet_hash
                            quote_amount
                            quote_token
                            receiver_display
                            sender_display
                            source_universal_chain_id
                        }
                        v2_unbonds(
                            args: {
                                p_addresses_canonical: ["${address}"],
                                p_source_universal_chain_id: "ethereum.1",
                                p_destination_universal_chain_id: "union.union-1"
                            }
                        ) {
                            base_amount
                            base_token
                            batch
                            destination_universal_chain_id
                            packet_hash
                            sender_display
                            source_universal_chain_id
                            success
                            unbond_send_timestamp
                            unbond_send_transaction_hash
                        }
                    }
                `,
            }),
        });
        const responseJson = await response.json();
        const responseBond = responseJson.data.v2_bonds as UnionIndexerBond[];
        const responseUnbond = responseJson.data.v2_unbonds as UnionIndexerUnbond[];

        // Unbond batch
        const indexerBatchesIdsResponse = await fetch(`/api/union/unbond-batch`);
        const releasedIds = (
            await indexerBatchesIdsResponse.json() as { id: number, released: string | null }[]
        ).filter(v => v.released !== null).map(v => v.id.toString());

        const result: IndexerTransaction[] = [];

        // map bond result
        responseBond.map(v => {
            const tokenA = getUnionIndexerToken({ universalChainId: v.source_universal_chain_id, address: v.base_token });
            const tokenB = getUnionIndexerToken({ universalChainId: v.destination_universal_chain_id, address: v.quote_token });
            result.push({
                action: "bond",
                amountA: v.base_amount,
                amountB: v.quote_amount,
                channelId: 0,
                denomA: v.base_token,
                hash: v.bond_send_transaction_hash,
                lst: "union",
                recipient: v.receiver_display,
                recipientChannelId: null,
                source: "union",
                status: v.delivery_success ? "success" : "pending",
                time: v.bond_send_timestamp,
                tokenIdA: tokenA?.id,
                tokenIdB: tokenB?.id,
                userAddress: v.sender_display,
            });
        })

        // map unbond result
        responseUnbond.map(v => {
            const tokenA = getUnionIndexerToken({ universalChainId: v.source_universal_chain_id, address: v.base_token });
            const tokenB = getUnionIndexerToken({ universalChainId: v.source_universal_chain_id, address: UNION_CONTRACTS.mainnet.uEvmAddress });
            result.push({
                action: "unbond",
                amountA: v.base_amount,
                batch: v.batch,
                channelId: 0,
                denomA: v.base_token,
                hash: v.unbond_send_transaction_hash,
                lst: "union",
                recipient: null,
                recipientChannelId: null,
                source: "union",
                status: releasedIds.includes(v.batch) ? "success" : "pending",
                time: v.unbond_send_timestamp,
                tokenIdA: tokenA?.id,
                tokenIdB: tokenB?.id,
                userAddress: v.sender_display,
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
        queryKey: ["transactions", "union", params.addresses.mainnet, params.timestampTransaction],
        queryFn: getUnion,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        refetchOnWindowFocus: true,
    });
}