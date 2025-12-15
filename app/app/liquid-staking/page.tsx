/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Details from "@/components/page/liquid-staking/details/details";
import FormBabylon from "@/components/page/liquid-staking/form/babylon/form";
import FormUnion from "@/components/page/liquid-staking/form/union/form";
import Intro from "@/components/page/liquid-staking/intro/intro";
import LiquidToken from "@/components/page/liquid-staking/liquid-token/liquid-token";
import Lottery from "@/components/page/liquid-staking/lottery/lottery";
import RateApr from "@/components/page/liquid-staking/rate-apr/rate-apr";
import Tokenomics from "@/components/page/liquid-staking/tokenomics/tokenomics";
import { useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import useDefi from "@/hooks/defi/useDefi";
import { useUnionLstData } from "@/hooks/liquidStakingContract/union/lstData";
import { useUnionExchangeRate } from "@/hooks/liquidStakingContract/union/rate";
import useBabylonCosmosContract from "@/hooks/useBabylonCosmosContract";
import useSuggestToken from "@/hooks/useSuggestToken";
import { Liquidity, LiquidStaking, Tokenomics as TokenomicsType } from "@/types/chain";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";

const Page = () => {
    const { account, tokens, refetchTokens: tokenRefetch, escherTokens } = useEscher();
    const { osmosis: defiOsmosis } = useDefi();
    const { suggestToken } = useSuggestToken();

    useEffect(() => {
        suggestToken();
    }, [suggestToken]);

    // Babylon
    const {
        queryApr: queryAprBabylon,
        queryInflation: queryInflationBabylon,
        queryLiquidity: queryLiquidityBabylon,
        queryParameters: queryParametersBabylon,
        queryTokenomics: queryTokenomicsBabylon,
    } = useBabylonCosmosContract();

    // Union
    const queryExchangeRateUnion = useUnionExchangeRate();
    const queryUnionLstData = useUnionLstData();

    const evmPublicClient = usePublicClient();
    const { data: evmWalletClient } = useWalletClient();

    const searchParams = useSearchParams();
    const defaultLiquid = searchParams.get("liquid");
    const isValidLiquid = (liquid: string | null): liquid is 'babylon' => {
        return ['babylon'].includes(liquid as string);
    };
    const [liquidStaking, setLiquidStaking] = useState<LiquidStaking | undefined>(
        isValidLiquid(defaultLiquid) ? defaultLiquid : undefined
    );

    const [tokenomics, setTokenomics] = useState<TokenomicsType>();
    const [tvl, setTvl] = useState<number>();
    const [apr, setApr] = useState<number>();
    const [inflation, setInflation] = useState<number>();
    const [exchangeRate, setExchangeRate] = useState<{ rate: number, baseSymbol: string, liquidSymbol: string }>();
    const [screenState, setScreenState] = useState<'intro' | 'app'>('intro');

    // LIQUIDITY
    const liquiditiyDatas = useMemo((): {
        babylon: Liquidity | undefined,
        union: Liquidity | undefined
    } => {
        return {
            babylon: queryLiquidityBabylon.data,
            union: {
                exchange_rate: queryExchangeRateUnion.data?.redemption_rate,
                amount: undefined,
                delegated: undefined,
                reward: undefined,
                time: undefined,
                total_supply: undefined
            }
        };
    }, [queryLiquidityBabylon.data, queryExchangeRateUnion.data]);

    // INFLATION
    const inflationDatas = useMemo(() => {
        return {
            babylon: queryInflationBabylon.data,
            union: queryUnionLstData.inflation,
        };
    }, [queryInflationBabylon.data, queryUnionLstData]);

    // TVL
    const tvlDatas = useMemo(() => {
        try {
            return {
                babylon: tokens.filter(v => v.symbol === "eBABY").reduce((sum, cur) => sum += (cur.tvl ?? 0), 0),
                union: queryUnionLstData.tvl ?? 0,
            }
        } catch (error) {
            console.error(error);
            return {
                babylon: undefined,
                union: undefined,
            }
        }
    }, [tokens, queryUnionLstData]);

    // TOKENOMICS
    const tokenomicDatas = useMemo(() => {
        return {
            babylon: {
                ...queryTokenomicsBabylon.data,
                delegated: liquiditiyDatas.babylon?.delegated ?? "0"
            },
        };
    }, [queryTokenomicsBabylon.data, liquiditiyDatas]);

    // UNBONDING TIME
    const unbondingTime = useMemo(() => {

        let seconds;
        if (liquidStaking === "babylon" && queryParametersBabylon.data?.unbonding_time) {
            seconds = queryParametersBabylon.data.unbonding_time + (BABYLON_CONTRACTS.unstakingOffset / 1000);
        }
        if (liquidStaking === "union") {
            return "27 - 31 days";
            // seconds = UNION_CONTRACTS.mainnet.unbondingPeriod;
        }

        if (!seconds) return "";

        const hours = (seconds / 3600);
        const totalDays = hours / 24;

        let text = "";
        if (totalDays >= 7) {
            text = `${Math.floor(totalDays)} days`;
        } else {
            text = `${Math.floor(hours)} hours`;
        }

        return text;
    }, [queryParametersBabylon.data, liquidStaking]);

    // APR
    const aprDatas = useMemo(() => {
        return {
            babylon: queryAprBabylon.data?.apr && (queryAprBabylon.data?.apr * 100),
            union: queryUnionLstData.apr && (queryUnionLstData.apr * 100)
        };
    }, [queryAprBabylon.data?.apr, queryUnionLstData.apr]);

    // DAILY TRADE
    const tradeDatas = useMemo(() => {
        return {
            babylon: [
                {
                    logo: defiOsmosis.info.logoURI,
                    amount: defiOsmosis.pools.reduce((sum, cur) => sum += (cur.pool.volume?.day ?? 0), 0)
                }
            ]
        }
    }, [defiOsmosis.info.logoURI, defiOsmosis.pools]);

    useEffect(() => {
        if (
            liquidStaking
        ) {
            switch (liquidStaking) {
                case "babylon":
                    setApr(aprDatas.babylon);
                    setTvl(tvlDatas.babylon);
                    setTokenomics(tokenomicDatas.babylon);
                    setExchangeRate({
                        rate: Number(liquiditiyDatas.babylon?.exchange_rate),
                        baseSymbol: "BABY",
                        liquidSymbol: "eBABY"
                    });
                    setInflation(inflationDatas.babylon);
                    break;

                case "union":
                    setApr(aprDatas.union);
                    setTvl(tvlDatas.union);
                    // setTokenomics(tokenomicDatas.babylon);
                    setExchangeRate({
                        rate: Number(queryExchangeRateUnion.data?.redemption_rate ?? 0),
                        baseSymbol: "U",
                        liquidSymbol: "eU"
                    });
                    // setInflation(inflationDatas.babylon);
                    break;
            }
            setScreenState('app');
        }
    }, [aprDatas.babylon, aprDatas.union, inflationDatas.babylon, liquidStaking, liquiditiyDatas.babylon?.exchange_rate, queryExchangeRateUnion.data?.redemption_rate, tokenomicDatas.babylon, tvlDatas.babylon, tvlDatas.union]);

    if (screenState === 'intro' || liquidStaking === undefined) {
        return (<>
            <Intro
                aprs={aprDatas}
                formTokens={escherTokens}
                inflationDatas={inflationDatas}
                liquidities={liquiditiyDatas}
                tvlDatas={tvlDatas}
                tradeDatas={tradeDatas}
                onNext={(lst) => setLiquidStaking(lst)}
            />
            <button className="w-full h-2" onClick={() => console.log({
                tokens,
                tokenomicDatas,
                liquiditiyDatas,
                tvlDatas,
                apr: queryAprBabylon.data
            })} />
        </>);
    }

    return (
        <div className="flex flex-col">
            {!APP_CONFIG.enableEvmStaking &&
                <div className="flex bg-escher-electricblue text-white justify-center text-sm font-medium py-3">
                    Due to ongoing Union maintenance, chain-abstracted staking is temporarily unavailable. We&apos;ll be back online soon—stay tuned!
                </div>
            }
            {/* 
            {APP_CONFIG.isStakingMaintenance &&
                <div className="flex bg-escher-electricblue text-white justify-center text-sm font-medium py-3">{APP_CONFIG.stakingMaintenanceMessage}</div>
            }
             */}
            <div className="w-full max-w-[537px] mx-auto flex flex-col py-8 gap-6">
                <Lottery />

                <LiquidToken
                    aprs={aprDatas}
                    rate={{
                        babylon: liquiditiyDatas.babylon?.exchange_rate,
                        union: queryExchangeRateUnion.data?.redemption_rate
                    }}
                    liquidToken={liquidStaking}
                    setLiquidToken={setLiquidStaking}
                    tvls={tvlDatas}
                />

                <RateApr
                    tvl={tvl}
                    apr={apr}
                    exchangeRate={exchangeRate}
                />

                {liquidStaking === "babylon" &&
                    <FormBabylon
                        account={account}
                        exchangeRate={exchangeRate}
                        publicClient={evmPublicClient}
                        tokenRefetch={tokenRefetch}
                        tokens={tokens.filter(t => t.lst?.includes("babylon"))}
                        unbondingTime={unbondingTime}
                        walletClient={evmWalletClient}
                    />
                }

                {liquidStaking === "union" &&
                    <FormUnion
                        account={account}
                        exchangeRate={queryExchangeRateUnion.data}
                        publicClient={evmPublicClient}
                        tokenRefetch={tokenRefetch}
                        tokens={tokens.filter(t => t.lst?.includes("union"))}
                        unbondingTime={unbondingTime}
                        walletClient={evmWalletClient}
                    />
                }

                {liquidStaking === "babylon" && <>
                    <Details
                        inflation={inflation}
                        token={{
                            native: escherTokens.babylon.baby,
                            liquid: escherTokens.babylon.ebaby
                        }}
                    />
                    <Tokenomics liquidToken={liquidStaking} tokenomics={tokenomics} />
                </>}
            </div>
        </div>
    );
}

export default Page;