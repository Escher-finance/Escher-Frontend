/* eslint-disable @typescript-eslint/no-explicit-any */
// reason: the return type of osmosis's client is way to complex
// see osmosis.ClientFactory.createRPCQueryClient

import { useEscher } from "@/components/providers/escherProvider";
import { CHAINS } from "@/configs/chains";
import { BABY_TOKENS, EBABY_TOKENS } from "@/configs/token";
import { DEFIS } from "@/lib/defi";
import { formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Defi, DefiPool } from "@/types/defi";
import { ChainContext } from "@cosmos-kit/core";
import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { osmosis } from 'osmojs';
import { useEffect, useMemo, useState } from "react";

export interface DefiOsmosisQuery {
    info: Defi
    pools: OsmosisPoolResult[]
    isFetched: boolean
}

export const useOsmosisDefi = (): DefiOsmosisQuery => {
    const defi = DEFIS.osmosis;

    const { account, escherTokens, tokens } = useEscher();
    const chainContext = useChain(CHAINS.osmosis.chainName!);
    const [queryClient, setQueryClient] = useState<any>();

    useEffect(() => {
        if (queryClient === undefined) {
            const getQueryClient = async () => {
                const rpcEndpoint = await chainContext.getRpcEndpoint();
                const _queryClient = await osmosis.ClientFactory.createRPCQueryClient({ rpcEndpoint: rpcEndpoint! });
                setQueryClient(_queryClient);
            }

            const initializeQueryClient = async () => {
                await getQueryClient();
            };
            initializeQueryClient();
        }
    }, [chainContext, queryClient]);

    const queryTvl = useQuery({
        queryKey: ["queryTvlOsmosis"],
        queryFn: () => getTvl(chainContext),
    });

    const tvl = useMemo(() => {
        if (queryTvl.data && escherTokens.babylon.baby?.coingeckoPrice && escherTokens.babylon.ebaby?.coingeckoPrice) {
            return (
                (queryTvl.data.baby * escherTokens.babylon.baby.coingeckoPrice) +
                (queryTvl.data.ebaby * escherTokens.babylon.ebaby.coingeckoPrice)
            );
        }
        return undefined;
    }, [queryTvl.data, escherTokens]);

    const poolQueries = useMultiPoolQuery({
        pools: defi.pools,
        address: account.cosmos?.address.osmosis,
        queryClient: queryClient,
        tokens: tokens
    });

    const data = useMemo((): Defi => ({
        ...defi,
        pools: poolQueries.map(p => p.pool),
        position: poolQueries.reduce((sum, p) => sum + (p.pool.position ?? 0), 0),
        tvl,
    }), [defi, poolQueries, tvl]);

    const isFetched = useMemo(() => poolQueries.every(pool => pool.isFetched), [poolQueries]);

    return {
        info: data,
        pools: poolQueries,
        isFetched
    };
}

const getTvl = async (chainContext: ChainContext) => {
    try {

        const client = await chainContext.getCosmWasmClient();
        const address = "osmo1ehnvg72e02eqnwvs49uvnuvmn9csestuj84uz46dc32pvuw8yt3q3awqj3";
        const babyToken = BABY_TOKENS.osmosis;
        const ebabyToken = EBABY_TOKENS.osmosis;

        const balanceBaby = await client.getBalance(address, babyToken.denom!);
        const balanceEBaby = await client.getBalance(address, ebabyToken.denom!);

        return ({
            baby: formatDecimal(Number(balanceBaby.amount), -6),
            ebaby: formatDecimal(Number(balanceEBaby.amount), -6),
        });

    } catch {
        return undefined;
    }
}

interface OsmosisMultiPoolsParams {
    pools: DefiPool[]
    address?: string
    queryClient?: any
    tokens: CustomToken[]
}

interface OsmosisPoolParams {
    address?: string
    pool: DefiPool
    queryClient?: any
    tokens: CustomToken[]
}

export interface OsmosisPoolResult {
    pool: DefiPool;
    isFetched: boolean
}

const useMultiPoolQuery = (params: OsmosisMultiPoolsParams): OsmosisPoolResult[] => {
    return params.pools.map((pool) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useOsmosisPool({
            address: params.address,
            pool,
            queryClient: params.queryClient,
            tokens: params.tokens
        })
    );
};

const useOsmosisPool = (params: OsmosisPoolParams): OsmosisPoolResult => {

    // Volume
    const getTradingVolume = async () => {
        if (!params.pool.poolId) {
            return undefined;
        }

        const volumeResponse = await fetch(`/api/osmosis/pool?poolId=${params.pool.poolId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const volumes = await volumeResponse.json();
        return volumes as {
            id: string,
            market: {
                volume24hUsd: {
                    amount: string
                }
                volume7dUsd: {
                    amount: string
                },
            },
            apr: {
                upper: string,
                lower: string,
                value: number
            }
        };
    }

    const queryTradingVolume = useQuery({
        queryKey: ["osmosis", "poolTradingVolume", params.pool.poolId],
        queryFn: getTradingVolume,
        enabled: !!params.pool.poolId
    });

    // User
    const getUserData = async () => {
        if (!params.address || !params.queryClient || !params.pool.poolId) return undefined;

        try {
            const positionsResponse = await params.queryClient.osmosis.concentratedliquidity.v1beta1.userPositions({
                poolId: BigInt(params.pool.poolId),
                address: params.address
            });
            return positionsResponse.positions as {
                asset0: {
                    amount: string
                    denom: string
                }
                asset1: {
                    amount: string
                    denom: string
                }
                claimableSpreadRewards: {
                    amount: string
                    denom: string
                }[]
            }[];

        } catch {
            return undefined;
        }
    };

    const queryUserData = useQuery({
        queryKey: ["osmosis", "poolUserData", params.pool.poolAddress, params.address],
        queryFn: getUserData,
        enabled: !!params.address && !!params.queryClient && !!params.pool.poolId
    });

    const data = useMemo((): DefiPool => {
        // Token
        const tokenA = params.tokens.find(t => t.id === params.pool.tokenA.id);
        const tokenB = params.tokens.find(t => t.id === params.pool.tokenB.id);

        // APR
        let apr: number | undefined = undefined;

        try {
            apr = queryTradingVolume.data?.apr.value;
        } catch { }

        // Volume
        let volume: {
            day?: number
            week?: number
        } | undefined;

        try {
            volume = queryTradingVolume.data && {
                day: Number(queryTradingVolume.data?.market.volume24hUsd.amount),
                week: Number(queryTradingVolume.data?.market.volume7dUsd.amount)
            };
        } catch { }

        // Position
        let position: number | undefined;
        let tokenAStaked: number | undefined;
        let tokenBStaked: number | undefined;

        queryUserData.data?.map(pool => {
            if (tokenA && tokenB) {
                const curTokenAAmount = formatDecimal(Number(pool.asset0.amount), -tokenA.decimals);
                const curTokenBAmount = formatDecimal(Number(pool.asset1.amount), -tokenB.decimals);

                tokenAStaked = (tokenAStaked ?? 0) + curTokenAAmount;
                tokenBStaked = (tokenBStaked ?? 0) + curTokenBAmount;
                if (
                    tokenA?.coingeckoPrice &&
                    tokenB?.coingeckoPrice
                ) {
                    position = (position ?? 0) + Number(
                        curTokenAAmount * Number(tokenA.coingeckoPrice) +
                        curTokenBAmount * Number(tokenB.coingeckoPrice)
                    );
                }
            }
        });

        // Reward
        const rewards: {
            token: CustomToken
            amount: number
        }[] = [];
        queryUserData.data?.map(pool => {
            pool.claimableSpreadRewards.map(claimableSpreadReward => {
                const token = params.tokens.find(t => t.denom === claimableSpreadReward.denom);
                if (token) {
                    const r_token = rewards.find(rewardToken => rewardToken.token.id === token.id);
                    if (r_token) {
                        r_token.amount += formatDecimal(Number(claimableSpreadReward.amount), -r_token.token.decimals);
                    } else {
                        rewards.push({
                            token: token,
                            amount: formatDecimal(Number(claimableSpreadReward.amount), -token.decimals)
                        })
                    }
                }
            });
        });

        return {
            ...params.pool,
            position,
            tokenAStaked,
            tokenBStaked,
            rewards,
            volume,
            aprSingle: apr
        }

    }, [params.tokens, params.pool, queryUserData.data, queryTradingVolume.data]);

    return {
        pool: data,
        isFetched: queryUserData.isFetched
    };
}