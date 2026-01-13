import { formatDecimal, formatNumber } from "@/lib/utils";
import { Liquidity, TowerMetric } from "@/types/chain";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const lst = "bbn1m7zr5jw4k9z22r9ajggf4ucalwy7uxvu9gkw6tnsmv42lvjpkwasagek5g";
const endpointRpc = "https://babylon.nodes.guru/rpc";
const endpointRest = "https://babylon.nodes.guru/api";

export default function useBabylonData() {

    // Liquidity data
    const getData = async () => {
        const headers = { 'Content-Type': 'application/json' };
        const client = await CosmWasmClient.connect(endpointRpc);

        const { validators: rawValidators } = await client.queryContractSmart(lst, { validators: {} });
        const validators = rawValidators as { address: string, weight: number }[];
        const validatorResponses = await Promise.all(
            validators.map(({ address }) =>
                fetch(`${endpointRest}/cosmos/staking/v1beta1/validators/${address}`, { headers }).then(res => res.json())
            )
        );

        const enrichedValidators = validators.map((v, i) => {
            const rate = Number(validatorResponses[i]?.validator?.commission?.commission_rates?.rate ?? 0);
            return { ...v, rate };
        });

        const totalWeight = enrichedValidators.reduce((sum, v) => sum + v.weight, 0);
        const weightedRateSum = enrichedValidators.reduce((sum, v) => sum + v.rate * v.weight, 0);
        const avgCommission = weightedRateSum / totalWeight;

        const [inflationRes, supplyRes, poolRes, liquidity, injections]: [any, any, any, Liquidity, { amount: string }[]] = await Promise.all([
            fetch(`${endpointRest}/cosmos/mint/v1beta1/inflation_rate`, { headers }).then(res => res.json()),
            fetch(`${endpointRest}/cosmos/bank/v1beta1/supply`, { headers }).then(res => res.json()),
            fetch(`${endpointRest}/cosmos/staking/v1beta1/pool`, { headers }).then(res => res.json()),
            client.queryContractSmart(lst, { staking_liquidity: {} }),
            fetch(`/api/injection`, { headers }).then(res => res.json()),
        ]);

        const stakedBaby = formatDecimal(Number(liquidity.amount), -6);
        const inflation = Number(inflationRes.inflation_rate) / 2;
        const totalSupply = supplyRes.supply.find((v: any) => v.denom === 'ubbn')?.amount ?? '0';
        const { bonded_tokens } = poolRes.pool;
        const ratio = Number(bonded_tokens) / Number(totalSupply);

        const injectionTable = formatDecimal(injections.reduce((sum, cur) => sum += Number(cur.amount), 0), -6);
        const injection = injectionTable / stakedBaby;

        // const apr = (inflation / ratio) * (1 - avgCommission) * 0.9;
        const apr = ((inflation / ratio) * (1 - avgCommission)) + injection;

        // 5. Fetch BABY price
        const coinPrice = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=babylon&vs_currencies=usd`,
            {
                headers: {
                    ...headers
                },
            }
        ).then(res => res.json());

        const babyPrice = coinPrice.babylon?.usd ?? 0;
        const exchangeRate = Number(liquidity.exchange_rate ?? 1);
        const ebabyPrice = babyPrice * exchangeRate;
        const tvl = (Number(liquidity.total_supply) / 1e6) * ebabyPrice;

        return {
            apr: `${(apr * 100).toFixed(2)}%`,
            tvl: `$${formatNumber(tvl)}`,
            ratio: `1 eBABY = ${exchangeRate.toFixed(4)} BABY`,
            price: `$${formatNumber(ebabyPrice)}`,
            inflation: inflation
        };
    };

    const { data: queryData } = useQuery({
        queryKey: ['dataBabylon'],
        queryFn: getData,
        refetchInterval: 10 * 60_000,
        staleTime: 10 * 60_000
    });

    // Daily trade
    async function getDailyTrade(): Promise<number | undefined> {
        try {
            let total = 0;

            // Tower
            try {
                const date = new Date();
                date.setUTCDate(date.getUTCDate() - 1);

                const input = {
                    "0": {
                        "addresses": [
                            "bbn1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgeslpzjvl"
                        ],
                        "startDate": date.toUTCString()
                    }
                };

                const queryTower = await fetch(`https://trpc-tower-production.quasar-labs-main.workers.dev/trpc/edge.indexer.getPoolMetricsByAddresses?batch=1&input=${encodeURIComponent(JSON.stringify(input))}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const responseTower = (await queryTower.json())[0].result.data["bbn1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgeslpzjvl"] as TowerMetric;


                const volume =
                    (formatDecimal(Number(responseTower.token0_swap_volume), -responseTower.token0_decimals) *
                        Number(responseTower.token0_price)
                    ) +
                    (formatDecimal(Number(responseTower.token1_swap_volume), -responseTower.token1_decimals) *
                        Number(responseTower.token1_price)
                    );
                console.log({ responseTower, volume, decimal: formatDecimal(Number(responseTower.token0_swap_volume), -responseTower.token0_decimals), token0price: Number(responseTower.token0_price) });
                total += volume;
            } catch (error) {
                console.error(error);
            }

            return total;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    const { data: dailyData } = useQuery({
        queryKey: ['dataBabylon', 'dailyTrade'],
        queryFn: getDailyTrade,
        refetchInterval: 10 * 60_000,
        staleTime: 10 * 60_000
    });

    const data = useMemo(() => {
        return {
            ...queryData,
            dailyTrade: dailyData
        }
    }, [queryData, dailyData]);

    return data
}