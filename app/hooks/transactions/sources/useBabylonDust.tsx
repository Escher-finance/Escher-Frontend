import { APP_CONFIG } from "@/configs/app";
import { EBABY_TOKENS } from "@/configs/token";
import { parseLocalDustData } from "@/hooks/local/useLocalDust";
import { getUnionPacketStatus } from "@/hooks/unionIndexer/packet";
import { IndexerTransaction, LocalDust } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";

const eUToken = EBABY_TOKENS.mainnet;

interface Params {
    addresses: {
        mainnet: string | undefined;
        babylon: string | undefined;
        osmosis: string | undefined;
    }
    timestampTransaction: number
}

export default function useBabylonDust(params: Params) {
    async function getData(): Promise<IndexerTransaction[]> {
        const address = params.addresses.mainnet;

        if (!address) return [];

        try {
            const localDataString = localStorage.getItem(APP_CONFIG.dbDust);
            let currentDusts: LocalDust[] = [];
            if (localDataString) {
                currentDusts = parseLocalDustData(localDataString).filter(v => v.lst === "babylon" && v.userAddress === address);
            }

            const results = await Promise.all(
                currentDusts
                    .filter(v => v.status === "pending")
                    .map(v => getUnionPacketStatus(v.transactionHash))
            );

            const newDusts: LocalDust[] = [];
            currentDusts.map(v => {
                const a = results.find(r => r.hash === v.transactionHash);
                let status = v.status;
                if (status === "pending") {
                    status = (a?.recv === true) ? "success" : "pending"
                }
                newDusts.push({
                    ...v,
                    status
                });
            })
            localStorage.removeItem(APP_CONFIG.dbDust);
            localStorage.setItem(APP_CONFIG.dbDust, JSON.stringify(newDusts));

            const result: IndexerTransaction[] = [];
            newDusts.map(v => {
                result.push({
                    action: "dust",
                    amountA: v.amountRaw,
                    channelId: 0,
                    denomA: eUToken.contractAddress!,
                    hash: v.transactionHash,
                    lst: "babylon",
                    recipient: v.userAddress,
                    recipientChannelId: null,
                    source: "local",
                    status: v.status,
                    time: v.time,
                    tokenIdA: eUToken.id,
                    userAddress: v.userAddress,
                });
            });
            return result;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    return useQuery({
        queryKey: ["transactions", "dust", "babylon", params.addresses.mainnet, params.timestampTransaction],
        queryFn: getData,
        refetchInterval: APP_CONFIG.transactionsRefetchInterval,
        refetchOnWindowFocus: true,
    });
}