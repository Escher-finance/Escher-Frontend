import { useEscher } from "@/components/providers/escherProvider";
import { CHAINS } from "@/configs/chains";
import { DEFIS } from "@/lib/defi";
import { formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Defi, DefiApr, DefiPool } from "@/types/defi";
import { ResponseTowerIncentive, ResponseTowerMetric, ResponseTowerUser } from "@/types/defiTower";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

// const testAddress = "bbn10rktvmllvgctcmhl5vv8kl3mdksukyqf2tdveh8drpn0sppugwwq2wykr0";

const trpcMetric = "https://trpc-tower-production.quasar-labs-main.workers.dev/trpc/edge.indexer.getPoolMetricsByAddresses,edge.indexer.getPoolMetricsByAddresses,edge.indexer.getPoolIncentivesByAddresses,edge.indexer.getPoolIncentivesByAddresses?batch=1&input=${input}"

const trpcGetUserBalances = "https://trpc-tower-production.quasar-labs-main.workers.dev/trpc/edge.indexer.getUserBalances?input=%7B%22address%22%3A%22${address}%22%7D";

const getMetric = async (pools: DefiPool[]) => {
    const date1 = new Date();
    date1.setUTCDate(date1.getUTCDate() - 1);
    const date7 = new Date();
    date7.setUTCDate(date7.getUTCDate() - 7);
    const poolAddresses = pools.map(pool => pool.poolAddress);
    const input = {
        "0": {
            "addresses": poolAddresses,
            "startDate": date1.toUTCString()
        },
        "1": {
            "addresses": poolAddresses,
            "startDate": date7.toUTCString()
        },
        "2": {
            "addresses": poolAddresses,
            "interval": 1
        },
        "3": {
            "addresses": poolAddresses,
            "interval": 7
        },
    };
    const metricResponse = await fetch(trpcMetric.replace("${input}", encodeURIComponent(JSON.stringify(input))), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const metric = await metricResponse.json();
    return metric;
}

const getUserPools = async (address?: string) => {
    if (!address) {
        throw "Invalid address";
    }

    const userPoolsResponse = await fetch(trpcGetUserBalances.replace("${address}", address), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const pools = (await userPoolsResponse.json()).result.data;

    return pools;
}

interface TowerPoolParams {
    address?: string
    pool: DefiPool
    cosmWasmClient?: CosmWasmClient
    tokens: CustomToken[]
    // reason : it's coming from tower's trpc, the structrue is too complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metricResponse: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userPoolResponse: any
}

export interface TowerPoolResult {
    data: DefiPool
    queryPoolData: UseQueryResult
    queryUserData: UseQueryResult
}

const useTowerPool = (params: TowerPoolParams): TowerPoolResult => {
    const metrics = useMemo(() => {
        try {
            return {
                day: {
                    responseMetric: params.metricResponse && params.metricResponse[0].result.data[params.pool.poolAddress] as ResponseTowerMetric | undefined,
                    responseIncentive: params.metricResponse && params.metricResponse[2].result.data[params.pool.poolAddress] as ResponseTowerIncentive | undefined,
                },
                week: {
                    responseMetric: params.metricResponse && params.metricResponse[1].result.data[params.pool.poolAddress] as ResponseTowerMetric | undefined,
                    responseIncentive: params.metricResponse && params.metricResponse[3].result.data[params.pool.poolAddress] as ResponseTowerIncentive | undefined,
                },
            }
        } catch (error) {
            console.error(error);
            return {
                day: {
                    responseMetric: undefined,
                    responseIncentive: undefined,
                },
                week: {
                    responseMetric: undefined,
                    responseIncentive: undefined,
                },
            }
        }
    }, [params.metricResponse, params.pool.poolAddress]);

    const getPoolData = async () => {
        const poolResponse = await params.cosmWasmClient?.queryContractSmart(
            params.pool.poolAddress,
            {
                pool: {}
            }
        );

        const tokenAPoolAmount = formatDecimal(Number(poolResponse.assets[0].amount), -params.pool.tokenA.decimals);
        const tokenBPoolAmount = formatDecimal(Number(poolResponse.assets[1].amount), -params.pool.tokenB.decimals);

        return {
            tokenAPoolAmount,
            tokenBPoolAmount
        }
    }

    const queryPoolData = useQuery({
        queryKey: ["poolData", params.pool.poolAddress],
        queryFn: getPoolData,
        enabled: false
    });

    const getUserData = async () => {
        const poolAssets = params.userPoolResponse.find((v: { pool_address: string; }) => v.pool_address == params.pool.poolAddress) as ResponseTowerUser | undefined;
        const assetsResponse = poolAssets ? await params.cosmWasmClient?.queryContractSmart(
            params.pool.poolAddress,
            {
                simulate_withdraw: {
                    lp_amount: poolAssets.staked_share_amount.toString(),
                },
            }
        ) : undefined;

        const tokenAStaked = assetsResponse && formatDecimal(Number(assetsResponse[0].amount), -params.pool.tokenA.decimals);
        const tokenBStaked = assetsResponse && formatDecimal(Number(assetsResponse[1].amount), -params.pool.tokenB.decimals);

        // Rewards
        let rewardsResponse: {
            amount: string
            info: {
                native_token: {
                    denom: string
                }
            }
        }[] = [];

        if (poolAssets && params.address) {
            rewardsResponse = await params.cosmWasmClient?.queryContractSmart(
                poolAssets.incentive_address,
                {
                    pending_rewards: {
                        lp_token: poolAssets.lpToken,
                        user: params.address
                    }
                }
            );
        }
        const rewards = rewardsResponse.map((reward) => {
            const token = params.pool.tokenA.denom === reward.info?.native_token?.denom ? params.pool.tokenA : params.pool.tokenB;
            return {
                token,
                amount: formatDecimal(Number(reward.amount), -token.decimals)
            }
        });

        return {
            incentiveAddress: poolAssets?.incentive_address,
            lpTokenAddress: poolAssets?.lpToken,
            rewards,
            staked_share_amount: poolAssets && Number(poolAssets.staked_share_amount),
            tokenAStaked,
            tokenBStaked,
        }
    }

    const queryUserData = useQuery({
        queryKey: ["poolUserData", params.pool.poolAddress, params.address, JSON.stringify(params.userPoolResponse)],
        queryFn: getUserData,
        enabled: false
        // enabled: !!params.address && !!params.userPoolResponse
    });

    const data = useMemo((): DefiPool => {
        // Token
        const tokenA = params.tokens.find(t => t.id === params.pool.tokenA?.id);
        const tokenB = params.tokens.find(t => t.id === params.pool.tokenB?.id);

        // Metric
        const metricDay = metrics.day?.responseMetric;
        const metricWeek = metrics.week?.responseMetric;
        const incentiveDay = metrics.day?.responseIncentive;
        const incentiveWeek = metrics.week?.responseIncentive;

        const tokenData = {
            price: {
                a: metricDay?.token0_price ?? metricWeek?.token0_price ?? tokenA?.coingeckoPrice,
                b: metricDay?.token1_price ?? metricWeek?.token1_price ?? tokenB?.coingeckoPrice
            },
            decimals: {
                a: metricDay?.token0_decimals ?? metricWeek?.token0_decimals ?? tokenA?.decimals,
                b: metricDay?.token1_decimals ?? metricWeek?.token1_decimals ?? tokenB?.decimals
            }
        }

        // TVL
        let tvl = 0;
        if (queryPoolData.data?.tokenAPoolAmount && queryPoolData.data?.tokenBPoolAmount
        ) {
            tvl = Number(tokenData.price.a) * queryPoolData.data?.tokenAPoolAmount +
                Number(tokenData.price.b) * queryPoolData.data?.tokenBPoolAmount;
        }

        // APR
        let apr: {
            day?: DefiApr
            week?: DefiApr
        } | undefined;

        try {
            const swapFees_1 = metricDay?.average_apr;
            const incentives_1 = calculateIncentiveApr(metricDay, incentiveDay, params.tokens);
            const totalApr_1 = (swapFees_1 ?? 0) + incentives_1;

            const swapFees_7 = metricWeek?.average_apr;
            const incentives_7 = calculateIncentiveApr(metricWeek, incentiveWeek, params.tokens);
            const totalApr_7 = (swapFees_7 ?? 0) + incentives_7;

            apr = {
                day: (swapFees_1) ? {
                    incentives: incentives_1,
                    swapFees: swapFees_1,
                    total: totalApr_1
                } : undefined,
                week: (swapFees_7) ? {
                    incentives: incentives_7,
                    swapFees: swapFees_7,
                    total: totalApr_7
                } : undefined,
            }
        } catch (error) {
            console.error("APR", error);
        }

        // Volume
        let volume: {
            day?: number
            week?: number
        } | undefined;

        // Position
        let position: number | undefined = undefined;

        if (tokenData.price.a && tokenData.price.b && tokenData.decimals.a && tokenData.decimals.b) {

            // Volume
            try {
                const volume_1 = metricDay ? (
                    (
                        formatDecimal(Number(metricDay.token0_swap_volume), -tokenData.decimals.a)
                        *
                        Number(tokenData.price.a)
                    ) + (
                        formatDecimal(Number(metricDay.token1_swap_volume), -tokenData.decimals.b)
                        *
                        Number(tokenData.price.b)
                    )
                ) : undefined;

                const volume_7 = metricWeek ? (
                    (
                        formatDecimal(Number(metricWeek.token0_swap_volume), -tokenData.decimals.a)
                        *
                        Number(tokenData.price.a)
                    ) + (
                        formatDecimal(Number(metricWeek.token1_swap_volume), -tokenData.decimals.b)
                        *
                        Number(tokenData.price.b)
                    )
                ) : undefined;

                volume = {
                    day: volume_1,
                    week: volume_7,
                }
            } catch (error) {
                console.log("Volume", error);
            }

            // Position
            if (queryUserData.data?.tokenAStaked && queryUserData.data?.tokenBStaked) {
                position = Number(
                    queryUserData.data?.tokenAStaked * Number(tokenData.price.a) +
                    queryUserData.data?.tokenBStaked * Number(tokenData.price.b)
                );
            }
        }

        return {
            ...params.pool,
            apr,
            incentiveAddress: queryUserData.data?.incentiveAddress,
            lpTokenAddress: queryUserData.data?.lpTokenAddress,
            position,
            rewards: queryUserData.data?.rewards,
            staked_share_amount: queryUserData.data?.staked_share_amount,
            tokenA: tokenA ?? params.pool.tokenA,
            tokenAPoolAmount: queryPoolData.data?.tokenAPoolAmount,
            tokenAStaked: queryUserData.data?.tokenAStaked,
            tokenB: tokenB ?? params.pool.tokenB,
            tokenBPoolAmount: queryPoolData.data?.tokenBPoolAmount,
            tokenBStaked: queryUserData.data?.tokenBStaked,
            tvl,
            volume,
        }
    }, [params.tokens, params.pool, metrics.day?.responseMetric, metrics.day?.responseIncentive, metrics.week?.responseMetric, metrics.week?.responseIncentive, queryPoolData.data?.tokenAPoolAmount, queryPoolData.data?.tokenBPoolAmount, queryUserData.data?.incentiveAddress, queryUserData.data?.lpTokenAddress, queryUserData.data?.rewards, queryUserData.data?.staked_share_amount, queryUserData.data?.tokenAStaked, queryUserData.data?.tokenBStaked]);

    return {
        data,
        queryPoolData,
        queryUserData
    }
}

interface TowerMultiPoolsParams {
    pools: DefiPool[]
    address?: string
    cosmWasmClient?: CosmWasmClient
    tokens: CustomToken[]
    // reason : it's coming from tower's trpc, the structrue is too complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metricResponse: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userPoolResponse: any
}

const useTowerMultiPools = (params: TowerMultiPoolsParams): TowerPoolResult[] => {
    return params.pools.map((pool) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTowerPool({
            address: params.address,
            pool,
            cosmWasmClient: params.cosmWasmClient,
            metricResponse: params.metricResponse,
            userPoolResponse: params.userPoolResponse,
            tokens: params.tokens
        })
    );
};

export interface DefiTowerQuery {
    info: Defi
    pools: TowerPoolResult[]
    isUserDataFetched: boolean
}

export const useTowerDefi = (): DefiTowerQuery => {
    const { account, tokens } = useEscher();
    const chainContext = useChain(CHAINS.babylon.chainName!);
    const [cosmWasmClient, setCosmWasmClient] = useState<CosmWasmClient>();

    useEffect(() => {
        const getClient = async () => {
            const client = await chainContext.getCosmWasmClient();
            if (client) {
                setCosmWasmClient(client);
            }
        }
        getClient();
    }, [chainContext]);

    const defi = DEFIS.tower;
    const queryMetric = useQuery({
        queryKey: ["towerMetric"],
        queryFn: () => getMetric(defi.pools),
        enabled: false
    });

    const queryUserPools = useQuery({
        queryKey: ["towerUserPools", account.cosmos?.address.babylon],
        // DEBUG
        // queryFn: () => getUserPools(testAddress),
        queryFn: () => getUserPools(account.cosmos?.address.babylon),
        enabled: false
        // enabled: !!account.cosmos?.address.babylon
    });

    const poolQueries = useTowerMultiPools({
        pools: defi.pools,
        // DEBUG
        // address: testAddress,
        address: account.cosmos?.address.babylon,
        cosmWasmClient: cosmWasmClient,
        metricResponse: queryMetric.data,
        userPoolResponse: queryUserPools.data,
        tokens: tokens
    });

    const info = useMemo((): Defi => ({
        ...defi,
        tvl: poolQueries.reduce((sum, pool) => sum += (pool.data.tvl ?? 0), 0),
        position: poolQueries.reduce((sum, pool) => sum += (pool.data.position ?? 0), 0),
    }), [defi, poolQueries]);

    const isUserDataFetched = useMemo(() => poolQueries.every(pool => pool.queryUserData.isFetched), [poolQueries]);

    return { info, isUserDataFetched, pools: poolQueries };
}

const calculateIncentiveApr = (
    metric: ResponseTowerMetric | null | undefined,
    incentive: ResponseTowerIncentive | null | undefined,
    tokens: CustomToken[]
) => {
    if (!metric || !incentive) return 0;

    const token = tokens.find(t => t.denom === incentive.reward_token);
    if (!token || token.coingeckoPrice === undefined) {
        console.error("Incentive token not found, or no price", token);
        return 0;
    }

    const yearInSeconds = 31557600;
    const total_incentives = incentive?.rewards_per_second ? Number(incentive.rewards_per_second) * yearInSeconds : 0;
    const incentives_apr = incentive?.rewards_per_second && metric.tvl_usd ?
        token.coingeckoPrice * formatDecimal(total_incentives, -incentive?.token_decimals) / metric.tvl_usd
        : 0;

    return incentives_apr;
};