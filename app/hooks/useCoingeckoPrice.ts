import { APP_CONFIG } from "@/configs/app";
import { CoingeckoPrice, CustomToken } from "@/types/chain";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useCoingeckoPrice = (tokens: CustomToken[]) => {

    function getPriceByDenom(params: { denom: string, amount: number }): number {
        if (!data) return 0;

        return (data.find(v => v.denom === params.denom)?.price ?? 0) * params.amount;
    }

    const ids = useMemo(() => {
        return tokens.filter(t => t.coingeckoId !== undefined).map(t => t.coingeckoId);
    }, [tokens]);

    async function getCoingeckoPrice(): Promise<CoingeckoPrice[]> {
        const response = await fetch(`/api/coingecko?ids=${ids.join("%2C")}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Failed to fetch data');
        }

        const resultArray: CoingeckoPrice[] = Object.entries(result.result).map(([coin, data]) => ({
            id: coin,
            denom: tokens.find(v => v.coingeckoId === coin)?.denom ?? "-",
            price: (data as { usd: number }).usd
        }));

        return resultArray;
    }

    const { data, ...rest } = useQuery({
        queryKey: ['coingecko', ids.join(",")],
        queryFn: getCoingeckoPrice,
        refetchInterval: APP_CONFIG.coingeckoRefetchInterval,
        staleTime: APP_CONFIG.coingeckoRefetchInterval,
    });

    return {
        data,
        ...rest,
        getPriceByDenom
    }
}

export default useCoingeckoPrice;