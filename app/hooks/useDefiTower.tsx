import { APP_CONFIG } from '@/configs/app'
import { CHAINS } from '@/configs/chains'
import { formatDecimal, getTokensByNetwork } from '@/lib/utils'
import { ResponseTowerIncentive, ResponseTowerMetric } from '@/types/defiTower'
import { Coin } from '@cosmjs/stargate'
import { ChainContext } from '@cosmos-kit/core'
import { useChain } from '@cosmos-kit/react'
import { useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import useCoingeckoPrice from './useCoingeckoPrice'

const TOKENS = getTokensByNetwork();

// Get rewards
interface UseDefiTowerRewardsProps {
    cosmosClient?: ChainContext
    userAddress?: string
    incentive_address: string
    lpToken: string
}
export function useDefiTowerRewards(props: UseDefiTowerRewardsProps) {
    const getData = async () => {
        const client = await props.cosmosClient?.getCosmWasmClient();
        const rewardsResponse = await client?.queryContractSmart(
            props.incentive_address,
            {
                pending_rewards: {
                    lp_token: props.lpToken,
                    user: props.userAddress
                }
            }
        );
        return rewardsResponse as {
            info: Record<string, unknown>
            amount: number
        }[];
    }

    return useQuery({
        queryKey: ["defiTowerRewards"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        enabled: !!props.cosmosClient && !!props.userAddress,
        refetchOnWindowFocus: false
    });
}

// Claim rewards
export interface ClaimInput {
    incentive_address: string
    lp_token: string
}

export function useDefiTowerClaim(
    options?: UseMutationOptions<string, Error, ClaimInput>
) {
    const cosmosChain = useChain(CHAINS.babylon.chainName ?? "");

    const submit = useCallback(async (claimInput: ClaimInput) => {
        const signingCosmWasmClient = await cosmosChain.getSigningCosmWasmClient();
        if (!cosmosChain.address) {
            throw "Account not connected";
        }

        const msg = {
            claim_rewards: {
                lp_tokens: [
                    claimInput.lp_token
                ]
            }
        };
        const funds: Coin[] = [];

        const res = await signingCosmWasmClient.execute(cosmosChain.address, claimInput.incentive_address, msg, "auto", undefined, funds);
        return res.transactionHash;
    }, [cosmosChain]);

    return useMutation({
        mutationFn: submit,
        ...options,
    })
}

// APR
interface UseDefiTowerMetricProps {
    interval?: number
}
export function useDefiTowerMetric(props?: UseDefiTowerMetricProps) {
    const interval = useMemo(() => {
        return props?.interval ?? 1;
    }, [props?.interval]);
    const { getPriceByDenom } = useCoingeckoPrice(TOKENS.filter(v => v.isBalanceWatch));

    const calculateIncentiveApr = useCallback((metric: ResponseTowerMetric | null | undefined, incentive: ResponseTowerIncentive | null | undefined) => {
        if (!metric) return 0;

        const yearInSeconds = 31557600;
        const total_incentives = incentive?.rewards_per_second ? Number(incentive.rewards_per_second) * yearInSeconds : 0;
        const incentives_apr = incentive?.rewards_per_second && metric.tvl_usd ?
            getPriceByDenom(
                {
                    denom: incentive?.reward_token,
                    amount: formatDecimal(total_incentives, -incentive?.token_decimals)
                }
            ) / metric.tvl_usd
            : 0;

        return incentives_apr;
    }, [getPriceByDenom])

    // Tower metric
    async function getTowerMetric() {
        try {
            const date = new Date();
            date.setUTCDate(date.getUTCDate() - interval);

            const poolAddress = "bbn1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgeslpzjvl";

            const input = {
                "0": {
                    "addresses": [
                        poolAddress
                    ],
                    "startDate": date.toUTCString()
                },
                "1": {
                    "addresses": [
                        poolAddress
                    ],
                    "interval": interval
                },
            };
            const queryTower = await fetch(`https://trpc-tower-production.quasar-labs-main.workers.dev/trpc/edge.indexer.getPoolMetricsByAddresses,edge.indexer.getPoolIncentivesByAddresses?batch=1&input=${encodeURIComponent(JSON.stringify(input))}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const responseTower = await queryTower.json();
            const responseMetric = responseTower[0].result.data[poolAddress] as ResponseTowerMetric | undefined;
            const responseIncentive = responseTower[1].result.data[poolAddress] as ResponseTowerIncentive | undefined;

            return {
                responseTower,
                responseMetric,
                responseIncentive,
            }
        } catch (error) {
            console.error(error);
        }
    }

    const queryMetric = useQuery({
        queryKey: ["defiApr"],
        queryFn: getTowerMetric,
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        staleTime: APP_CONFIG.balanceRefetchInterval,
    });

    const data = useMemo(() => {
        const swapFees = queryMetric.data?.responseMetric?.average_apr;
        const incentives = calculateIncentiveApr(queryMetric.data?.responseMetric, queryMetric.data?.responseIncentive);
        return {
            tvl: queryMetric.data?.responseMetric?.tvl_usd,
            swapFees: swapFees,
            incentives: incentives,
            total: (swapFees ?? 0) + incentives
        }
    }, [queryMetric.data?.responseMetric, queryMetric.data?.responseIncentive, calculateIncentiveApr]);

    return {
        data,
        queryMetric
    }
}