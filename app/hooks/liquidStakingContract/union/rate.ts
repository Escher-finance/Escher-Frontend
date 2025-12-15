import { useQuery } from "@tanstack/react-query";

export interface UnionRate {
    redemption_rate: string
    purchase_rate: string
}

export const getUnionExchangeRate = async (params?: { isTestnet?: boolean }): Promise<UnionRate> => {
    // return 1.1;
    const response = await fetch((`/api/union?${params?.isTestnet ? "testnet=1" : ""}`), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const result = await response.json();
    return {
        redemption_rate: result.contractData.data.redemption_rate as string,
        purchase_rate: result.contractData.data.purchase_rate as string,
    }
}

export const useUnionExchangeRate = (params?: { isTestnet?: boolean }) => {
    return useQuery({
        queryKey: ["lst", "union", "currentRate", `testnet=${params?.isTestnet ? "1" : "0"}`],
        queryFn: () => getUnionExchangeRate(params)
    });
}