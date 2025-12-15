import { APP_CONFIG } from "@/configs/app";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { sleep } from "@/lib";
import { formatDecimal } from "@/lib/utils";
import { Apr, Liquidity, Parameters, Tokenomics, Validator } from "@/types/chain";
import { ResponseTowerMetric } from "@/types/defiTower";
import { ProgressStatus } from "@/types/status";
import { ChainContext } from "@cosmos-kit/core";
import { useChain } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatUnits } from "viem";

const useBabylonCosmosContract = () => {
    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');

    const lst = BABYLON_CONTRACTS.lst;
    const { getCosmWasmClient } = useChain(
        CHAINS.babylon.chainName ?? ""
    );

    // PARAMETERS
    async function getParameters(): Promise<Parameters> {
        const client = await getCosmWasmClient();

        const msg: { parameters: Record<string, unknown> } = {
            parameters: {}
        };

        const result = await client?.queryContractSmart(
            lst,
            msg
        );

        return result;
    }

    const queryParameters = useQuery({
        queryKey: ['parametersBabylon'],
        queryFn: () => getParameters(),
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        staleTime: APP_CONFIG.balanceRefetchInterval,
    });

    // TOKENOMICS
    async function getTokenomics(): Promise<Tokenomics> {
        const response = await fetch(`${BABYLON_CONTRACTS.rest}/cosmos/staking/v1beta1/pool`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // total supply
        const querySupply = await getTotalSupply();

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Failed to fetch data');
        }

        return {
            total_supply: querySupply.babylon.toString(),
            not_bonded_tokens: result.pool.not_bonded_tokens ?? 0,
            bonded_tokens: result.pool.bonded_tokens ?? 0,
            delegated: result.pool.delegated ?? 0,
        };
    }

    const queryTokenomics = useQuery({
        queryKey: ['tokenomicsBabylon'],
        queryFn: () => getTokenomics(),
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        staleTime: APP_CONFIG.balanceRefetchInterval,
    });

    // LIQUIDITY
    async function getLiquidity(): Promise<Liquidity> {
        const client = await getCosmWasmClient();

        const msg: { staking_liquidity: Record<string, unknown> } = {
            staking_liquidity: {}
        };

        const liquidity = await client?.queryContractSmart(
            lst,
            msg
        );

        return liquidity as Liquidity
    }

    const queryLiquidity = useQuery({
        queryKey: ['liquidityBabylon'],
        queryFn: () => getLiquidity(),
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        staleTime: APP_CONFIG.balanceRefetchInterval,
    });

    // TOTAL SUPPLY
    async function getTotalSupply() {
        const querySupply = await fetch(`${BABYLON_CONTRACTS.rest}/cosmos/bank/v1beta1/supply`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const totalSupply = Number((await querySupply.json()).supply.find((v: { denom: string; amount: string }) => v.denom === "ubbn").amount ?? "0");

        return {
            babylon: totalSupply
        };
    }

    // APR
    async function getApr(): Promise<Apr> {
        const client = await getCosmWasmClient();

        // Validators
        const msg: { validators: Record<string, unknown> } = {
            validators: {}
        };
        const queryValidators = await client?.queryContractSmart(
            lst,
            msg
        );
        const validators = queryValidators.validators as { address: string, weight: number, rate: number }[];
        await Promise.all(
            validators.map(async (validator) => {
                const queryValidator = await fetch(`${BABYLON_CONTRACTS.rest}/cosmos/staking/v1beta1/validators/${validator.address}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const validatorResponse = (await queryValidator.json()).validator as Validator;
                validator.rate = Number(validatorResponse?.commission?.commission_rates?.rate);
            })
        );
        let c = 0;
        const totalWeight = validators.reduce((sum, v) => sum + v.weight, 0);
        validators.map(v => {
            c += (v.rate * v.weight);
        });
        c /= totalWeight;

        // Annual infation rate
        const inflation = await getInflation();
        if (!inflation) throw "Failed to fetch inflation";

        // total supply
        const querySupply = await getTotalSupply();

        // tokens for ratio 
        const tokenomics = await getTokenomics();
        const ratio = Number(tokenomics.bonded_tokens) / Number(querySupply.babylon);

        // Liquidity 
        const liquidity = await getLiquidity();
        const stakedBaby = formatDecimal(Number(liquidity.amount), -6);

        // injection

        const queryInjection = await fetch(`/api/injection`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const resultInjection = await queryInjection.json() as { amount: string }[];
        const injectionTable = formatDecimal(resultInjection.reduce((sum, cur) => sum += Number(cur.amount), 0), -6);
        const injection = injectionTable / stakedBaby;

        //APR
        // const apr = (inflation / ratio) * (1 - c) * 0.9;
        const apr = ((inflation / ratio) * (1 - c)) + injection;

        return { validators, inflation, ratio, apr };
    }

    // async function bak_getApr(): Promise<Apr> {
    //     const client = await getCosmWasmClient();

    //     // Validators
    //     const msg: { validators: Record<string, unknown> } = {
    //         validators: {}
    //     };
    //     const queryValidators = await client?.queryContractSmart(
    //         lst,
    //         msg
    //     );
    //     const validators = queryValidators.validators as { address: string, weight: number, rate: number }[];
    //     await Promise.all(
    //         validators.map(async (validator) => {
    //             const queryValidator = await fetch(`${BABYLON_CONTRACTS.rest}/cosmos/staking/v1beta1/validators/${validator.address}`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 }
    //             });

    //             const validatorResponse = (await queryValidator.json()).validator as Validator;
    //             validator.rate = Number(validatorResponse?.commission?.commission_rates?.rate);
    //         })
    //     );
    //     let c = 0;
    //     const totalWeight = validators.reduce((sum, v) => sum + v.weight, 0);
    //     validators.map(v => {
    //         c += (v.rate * v.weight);
    //     });
    //     c /= totalWeight;

    //     // Annual infation rate
    //     const inflation = await getInflation();
    //     if (!inflation) throw "Failed to fetch inflation";

    //     // total supply
    //     const querySupply = await getTotalSupply();

    //     // tokens for ratio 
    //     const tokenomics = await getTokenomics();
    //     const ratio = Number(tokenomics.bonded_tokens) / (Number(tokenomics.bonded_tokens) + Number(querySupply.babylon));

    //     //APR
    //     const apr = (inflation / ratio) * (1 - c) * 0.9;

    //     return { validators, inflation, ratio, apr };
    // }

    const queryApr = useQuery({
        queryKey: ['aprBabylon'],
        queryFn: () => getApr(),
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        staleTime: APP_CONFIG.balanceRefetchInterval,
    });

    // Inflation
    async function getInflation(): Promise<number | undefined> {
        try {
            // Annual infation rate
            const queryInflation = await fetch(`${BABYLON_CONTRACTS.rest}/cosmos/mint/v1beta1/inflation_rate`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const inflation = Number((await queryInflation.json()).inflation_rate) / 2; // half to bitcoin, and baby staker
            return inflation;

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    const queryInflation = useQuery({
        queryKey: ['inflationBabylon'],
        queryFn: getInflation,
        refetchInterval: APP_CONFIG.longRefetchInterval,
        staleTime: APP_CONFIG.longRefetchInterval,
        refetchOnWindowFocus: false
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
                const responseTower = (await queryTower.json())[0].result.data["bbn1hs95lgvuy0p6jn4v7js5x8plfdqw867lsuh5xv6d2ua20jprkgeslpzjvl"] as ResponseTowerMetric;

                const volume =
                    (Number(formatUnits(BigInt(responseTower.token0_swap_volume), responseTower.token0_decimals)) * Number(responseTower.token0_price))
                    +
                    (Number(formatUnits(BigInt(responseTower.token1_swap_volume), responseTower.token1_decimals)) * Number(responseTower.token1_price));

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

    const queryDailyTrade = useQuery({
        queryKey: ['dailyTradeBabylon'],
        queryFn: getDailyTrade,
        refetchInterval: APP_CONFIG.longRefetchInterval,
        staleTime: APP_CONFIG.longRefetchInterval,
    });

    const faucet = async (
        cosmosChain: ChainContext
    ) => {
        console.log('useBabylonCosmosContract:faucet');
        setStatusPrepare('onProgress');
        try {
            if (!cosmosChain.address) {
                throw ("Account not connected");
            }

            const signingCosmWasmClient = await cosmosChain.getSigningCosmWasmClient();
            const clientChainId = await signingCosmWasmClient.getChainId();
            console.log({
                signingCosmWasmClient,
                clientChainId
            });

            const msg = {
                withdraw: {}
            };
            const res = await signingCosmWasmClient.execute(cosmosChain.address, BABYLON_CONTRACTS.faucet, msg, "auto");
            console.log({ res });
            await sleep(5);
            setStatusOperation('success');

            return res.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const faucetApi = async (
        cosmosChain: ChainContext
    ) => {
        console.log('useBabylonCosmosContract:faucetApi');
        setStatusPrepare('onProgress');
        try {
            if (!cosmosChain.address) {
                throw ("Account not connected");
            }

            const response = await fetch('/api/faucet', {
                method: 'POST',
                body: JSON.stringify({
                    toAddress: cosmosChain.address
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            console.log({ result });
            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            return result.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    return {
        faucet,
        faucetApi,

        queryApr,
        queryDailyTrade,
        queryInflation,
        queryLiquidity,
        queryParameters,
        queryTokenomics,
        statusOperation,
        statusPrepare,
    };
}

export default useBabylonCosmosContract;
