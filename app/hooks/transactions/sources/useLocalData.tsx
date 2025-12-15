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

export default function useLocalData(params: Params) {
    async function getData(): Promise<IndexerTransaction[]> {
        try {
            const localData = localStorage.getItem(APP_CONFIG.dbTransaction);
            if (localData) {
                return (JSON.parse(localData) as IndexerTransaction[])
                    .filter(v => ["bridge"]
                        .includes(v.action))
                    .sort((x, y) => x.time < y.time ? 1 : -1);
            }
        } catch (error) {
            console.error(error);
        }

        return [];
    }

    return useQuery({
        queryKey: ["transactions", "local-data", params.addresses, params.timestampTransaction],
        queryFn: getData,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        refetchOnWindowFocus: true
    });
}