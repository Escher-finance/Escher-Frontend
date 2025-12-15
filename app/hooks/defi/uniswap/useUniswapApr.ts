import { useEscher } from "@/components/providers/escherProvider";
import { DefiPool } from "@/types/defi";
import { UniV3AprDataResponse } from "@/types/subgraph";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    Address,
    erc20Abi,
    formatUnits,
    getContract,
    PublicClient,
} from "viem";

export interface UniswapV3AprResponse {
    aprs: {
        avg: number;
        latest: number;
        highest: number;
    };
    calculationInputs: {
        feeTier: number;
        tvlUsd: number;
        avg24hVolumeUsd: number;
        latest24hVolumeUsd: number;
        highest24hVolumeUsd: number;
    };
}

const BIPS_BASE = 10000;
const _calculateApr = (
    volume24h: number,
    feeTier: number,
    tvl: number,
): number => {
    return (
        Math.round(volume24h * (feeTier / (BIPS_BASE * 100)) * 365) /
        Math.round(tvl)
    );
};

interface Params {
    publicClient?: PublicClient;
    pool: DefiPool;
}

export const useUniswapApr = (params: Params) => {
    const { tokens } = useEscher();

    const getData = async () => {
        const { tokenA: token0, tokenB: token1 } = params.pool;
        const poolAddress = params.pool.poolAddress as Address;
        if (
            !params.publicClient ||
            !token0.contractAddress ||
            !token1.contractAddress
        ) {
            return;
        }

        const token0Contract = getContract({
            address: token0.contractAddress,
            abi: erc20Abi,
            client: params.publicClient,
        });
        const token1Contract = getContract({
            address: token1.contractAddress,
            abi: erc20Abi,
            client: params.publicClient,
        });

        const t0Balance = Number(
            formatUnits(
                await token0Contract.read.balanceOf([poolAddress]),
                token0.decimals,
            ),
        );
        const t1Balance = Number(
            formatUnits(
                await token1Contract.read.balanceOf([poolAddress]),
                token1.decimals,
            ),
        );

        const response = await fetch(
            `/api/univ3-apr-data?pool=${poolAddress.toLowerCase()}`,
        );
        const { data }: UniV3AprDataResponse = await response.json();
        return {
            aprData: data ?? undefined,
            t0Balance,
            t1Balance
        }
    }

    const query = useQuery({
        queryKey: ["uniswap", "apr", params.pool?.poolAddress, params.pool?.fee],
        queryFn: getData,
        enabled: !!params.publicClient && !!params.pool,
    });

    const data = useMemo((): UniswapV3AprResponse | undefined => {

        const { tokenA: token0, tokenB: token1 } = params.pool;
        const t0Price = tokens.find(t => t.id === token0.id)?.coingeckoPrice;
        const t1Price = tokens.find(t => t.id === token1.id)?.coingeckoPrice;
        const aprData = query.data?.aprData;

        if (
            !query.data ||
            !aprData ||
            !t0Price ||
            !t1Price
        ) return undefined;

        const tvlUsd = (query.data.t0Balance * t0Price) + (query.data.t1Balance * t1Price);

        const avg24hVolumeUsd =
            aprData.avgVolume24hToken0 * t0Price +
            aprData.avgVolume24hToken1 * t1Price;
        const avgApr = _calculateApr(avg24hVolumeUsd, aprData.feeTier, tvlUsd);

        const highest24hVolumeUsd =
            aprData.highestVolume24hToken0 * t0Price +
            aprData.highestVolume24hToken1 * t1Price;
        const highestApr = _calculateApr(
            highest24hVolumeUsd,
            aprData.feeTier,
            tvlUsd,
        );

        const latest24hVolumeUsd =
            aprData.latestVolume24hToken0 * t0Price +
            aprData.latestVolume24hToken1 * t1Price;
        const latestApr = _calculateApr(
            latest24hVolumeUsd,
            aprData.feeTier,
            tvlUsd,
        );

        return {
            aprs: {
                avg: avgApr,
                highest: highestApr,
                latest: latestApr,
            },
            calculationInputs: {
                feeTier: aprData.feeTier,
                tvlUsd,
                avg24hVolumeUsd,
                highest24hVolumeUsd,
                latest24hVolumeUsd,
            },
        }
    }, [params.pool, query.data, tokens]);

    return {
        data,
        refetch: query.refetch
    }
};
