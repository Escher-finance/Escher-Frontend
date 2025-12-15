import { APP_CONFIG } from "@/configs/app";
import { IndexerTransaction } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";

interface Params {
    addresses: {
        mainnet: string | undefined;
        babylon: string | undefined;
        osmosis: string | undefined;
    }
    timestampTransaction: number
}

export default function useThegraph(params: Params) {
    async function getGraph(): Promise<IndexerTransaction[]> {
        const query = [
            // DEBUG
            // Comment to disable query per address
            params.addresses.mainnet ? `evm=${params.addresses.mainnet}` : null
        ]
            .filter(Boolean)
            .join('&');

        // Indexer
        const response = await fetch(`/api/transactions-graph?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Failed to fetch data');
        }

        return result;
    }

    return useQuery({
        queryKey: ["transactions", "graph", params.addresses.mainnet, params.timestampTransaction],
        queryFn: getGraph,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        refetchOnWindowFocus: true,
        enabled: false // Disable thegraph for now
    });
}