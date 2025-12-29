import { AddressLuckyDraw } from "@/app/lucky-draw/page";
import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useDefi from "@/hooks/defi/useDefi";
import { useUnionLstData } from "@/hooks/liquidStakingContract/union/lstData";
import useBabylonCosmosContract from "@/hooks/useBabylonCosmosContract";
import { buildUrl, formatDecimal, formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";

interface LotteryConfig {
    minimum_usd: number
    base_usd: number
    whale_usd: number
    whale_damping_factor: number
    step_multiplier: number
}

interface IndexerRatesComp {
    hodl_ticket_rate: number
    hodl_avg_usd: number
    lp_ticket_rate: number
    lp_avg_usd: number
}

interface IndexerRates {
    babylon: IndexerRatesComp
    union: IndexerRatesComp
}

const HODL_LotteryConfig: LotteryConfig = {
    minimum_usd: 100,
    base_usd: 50,
    whale_usd: 1000,
    whale_damping_factor: 0.95,
    step_multiplier: 24
};

const LP_LotteryConfig: LotteryConfig = {
    minimum_usd: 200,
    base_usd: 100,
    whale_usd: 2000,
    whale_damping_factor: 0.95,
    step_multiplier: 24
};

// DEBUG
const debugRate = false;
// const testAddress = "bbn10rktvmllvgctcmhl5vv8kl3mdksukyqf2tdveh8drpn0sppugwwq2wykr0";

interface Props {
    address: AddressLuckyDraw
}

const Position = (props: Props) => {
    const { tokens, escherTokens, isTokenBalanceFetched } = useEscher();

    const defis = useDefi();
    const {
        queryApr: queryAprBabylon
    } = useBabylonCosmosContract();

    const { apr: aprUnion } = useUnionLstData();

    const apr = useMemo(() => {
        return queryAprBabylon.data?.apr;
    }, [queryAprBabylon.data]);

    const [testValue, setTestValue] = useState("0");
    const [testValueLp, setTestValueLp] = useState("0");

    const getUserRates = async (): Promise<IndexerRates> => {
        const response = await fetch(buildUrl("/api/lucky-draw/user-rate", [
            { key: "babylon", value: props.address.babylon },
            { key: "ethereum", value: props.address.ethereum }
        ]), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = (await response.json()) as IndexerRates;
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        return result;
    }

    const queryUserRates = useQuery({
        queryKey: ["luckydraw", "user-rates", props.address.babylon, props.address.ethereum],
        queryFn: getUserRates,
        enabled: !!props.address.babylon || !!props.address.ethereum
    });

    const position = useMemo(() => {
        const hodl = {
            babylon: 0,
            union: 0
        }
        const lp = {
            babylon: 0,
            union: 0
        }

        let lpUniswap = 0;

        if (debugRate) {
            hodl.babylon = Number(testValue);
            hodl.union = Number(testValue);
            lp.babylon = Number(testValueLp);
            lp.union = Number(testValueLp);
        } else {
            // HODL babylon
            if (queryUserRates.data?.babylon.hodl_avg_usd && queryUserRates.data?.babylon.hodl_avg_usd > 0) {
                hodl.babylon = queryUserRates.data.babylon.hodl_avg_usd
            } else {
                hodl.babylon = tokens
                    .filter(t => t.isLiquid && t.lst?.includes("babylon"))
                    .reduce((sum, cur) => sum += Number(cur.balance?.dollarValue ?? 0), 0);
            }
            // HODL ethereum
            if (queryUserRates.data?.union.hodl_avg_usd && queryUserRates.data?.union.hodl_avg_usd > 0) {
                hodl.union = queryUserRates.data.union.hodl_avg_usd
            } else {
                hodl.union = tokens
                    .filter(t => t.isLiquid && t.lst?.includes("union"))
                    .reduce((sum, cur) => sum += Number(cur.balance?.dollarValue ?? 0), 0);
            }

            // LP local

            // Uniswap
            lpUniswap += defis.uniswap.pools.filter(v => v.defiPool.lst === "union").reduce((sum, cur) => sum += (cur.position?.totalValue ?? 0), 0);

            // LP Babylon
            if (queryUserRates.data?.babylon.lp_avg_usd && queryUserRates.data?.babylon.lp_avg_usd > 0) {
                lp.babylon = 0; // queryUserRates.data.babylon.lp_avg_usd; we are not tracking it anymore
            } else {
                lp.babylon = 0; // +=  lpUniswap; same
            }

            // LP Union
            if (queryUserRates.data?.union.lp_avg_usd && queryUserRates.data?.union.lp_avg_usd > 0) {
                lp.union = queryUserRates.data.union.lp_avg_usd;
            } else {
                lp.union += 0; // TODO need to separate lst in lp
            }
        }

        return {
            icon: escherTokens.babylon.ebaby.icon,
            balance: tokens.filter(t => t.isLiquid).reduce((sum, cur) => sum += formatDecimal(Number(cur.balance?.value ?? 0), -cur.decimals), 0),
            totalValue: hodl.babylon + hodl.union + lp.babylon + lp.union,
            values: {
                hodl: {
                    babylon: hodl.babylon,
                    union: hodl.union
                },
                lp: {
                    babylon: lp.babylon,
                    union: lp.union
                },
            },
            lpValues: {
                uniswap: lpUniswap,
            },
            rates: approximateLotteryRates(
                { babylon: hodl.babylon, union: hodl.union },
                { babylon: lp.babylon, union: lp.union },
                queryUserRates.data
            )
        }
    }, [queryUserRates.data, tokens, escherTokens, testValue, testValueLp, defis.uniswap.pools]);

    const sticksCount = 50;
    const curStick = useMemo(() => {
        return {
            hodl: {
                babylon: (position.values.hodl.babylon - position.rates.hodl.babylon.lowUsd) /
                    (position.rates.hodl.babylon.highUsd - position.rates.hodl.babylon.lowUsd) *
                    sticksCount,
                union: (position.values.hodl.union - position.rates.hodl.union.lowUsd) /
                    (position.rates.hodl.union.highUsd - position.rates.hodl.union.lowUsd) *
                    sticksCount,
            },
            lp: {
                babylon: (position.values.lp.babylon - position.rates.lp.babylon.lowUsd) /
                    (position.rates.lp.babylon.highUsd - position.rates.lp.babylon.lowUsd) *
                    sticksCount,
                union: (position.values.lp.union - position.rates.lp.union.lowUsd) /
                    (position.rates.lp.union.highUsd - position.rates.lp.union.lowUsd) *
                    sticksCount,
            }
        }
    }, [sticksCount, position.values, position.rates]);

    return (
        <Card className="row-span-2 text-sm gap-4 dark:bg-escher-dark_0c203d">
            <div className="flex flex-col">
                <div className="flex items-start justify-between">
                    <div
                        className="text-black dark:text-white"
                        onClick={() => console.log({ position, curStick, indexerRates: queryUserRates.data })}
                    >
                        <div>My Position</div>
                        <div className="flex gap-2 items-center mt-2">
                            {isTokenBalanceFetched ?
                                <>
                                    <div className="dark:text-white text-3xl font-semibold leading-none">${formatNumber(position.totalValue)}</div>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger>
                                                <Icon type="FiInfo" className="text-escher-electricblue dark:text-white" />
                                            </TooltipTrigger>
                                            <TooltipContent className="flex flex-col gap-2 bg-white text-escher-text2 shadow-lg border p-4">
                                                <div className="flex items-center gap-1 border border-escher-dedfff rounded-full p-1">
                                                    <Image src="/images/token/e-babylon.svg" alt="" className="w-4 h-4" width={16} height={16} />
                                                    <div className="text-xs text-escher-text2 font-semibold">${formatNumber(position.values.hodl.babylon)}</div>
                                                </div>
                                                <div className="flex items-center gap-1 border border-escher-dedfff rounded-full p-1">
                                                    <Image src="/images/token/e-union.svg" alt="" className="w-4 h-4" width={16} height={16} />
                                                    <div className="text-xs text-escher-text2 font-semibold">${formatNumber(position.values.hodl.union)}</div>
                                                </div>
                                                <div className="flex items-center gap-1 border border-escher-dedfff rounded-full p-1">
                                                    <Image src="/images/apps/app-uniswap-circle-2.svg" alt="" className="w-4 h-4" width={16} height={16} />
                                                    <div className="text-xs text-escher-text2 font-semibold">${formatNumber(position.lpValues.uniswap)}</div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </>
                                :
                                <LdrsAnimation />
                            }
                        </div>
                    </div>

                    <div className="text-sm text-sky-50 bg-escher-electricblue bg-opacity-80 dark:bg-opacity-25 border border-escher-electricblue dark:border-escher-electricblue rounded px-2 py-1.5 font-medium self-start flex flex-col gap-1">
                        <div className="self-center font-semibold">APR</div>
                        <div className="flex items-center gap-1 text-xs">
                            <Image alt="" src="/images/token/e-babylon.svg" className="w-4 h-4" width={16} height={16} />
                            {apr ?
                                <div>~ {(apr * 100).toFixed(2)}%</div>
                                :
                                <div className="ml-1">
                                    <LdrsAnimation size={16} />
                                </div>
                            }
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <Image alt="" src="/images/token/e-union.svg" className="w-4 h-4" width={16} height={16} />
                            {aprUnion ?
                                <div>~ {(aprUnion * 100).toFixed(2)}%</div>
                                :
                                <div className="ml-1">
                                    <LdrsAnimation size={16} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="flex border border-escher-dedfff dark:border-escher-darkblue_2 rounded-full p-1 self-start mt-2">
                    <Image alt="" src="/images/token/e-babylon.svg" className="w-4 h-4" width={16} height={16} />
                    <Image alt="" src="/images/token/e-union.svg" className="w-4 h-4 -ml-1" />
                    <Image alt="" src="/images/apps/app-uniswap-circle-2.svg" className="w-4 h-4 -ml-1" />
                    {/* <Image alt="" src="/images/apps/app-osmosis-circle-2.svg" alt="" className="w-4 h-4 -ml-1.5" /> */}
                </div>
            </div>
            <div className="flex-1 bg-escher-gray50 dark:bg-escher-dark_071b39 border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg p-4 flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <div className="text-escher-667085 dark:text-white text-xs">My Current Total Rate</div>
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger>
                                    <Icon type="FiInfo" className="text-escher-667085 dark:text-white" size="sm" />
                                </TooltipTrigger>
                                <TooltipContent className="flex flex-col bg-white text-escher-text2 shadow-lg border p-4">
                                    <div><b>Why Your Balance Might Not Change Right Away</b></div>
                                    <div>We update your <b>official balance</b> hourly from our servers.</div>
                                    <div>If you&apos;ve just joined or made a deposit, you&apos;ll see an instant estimate until the next update.</div>
                                    <div>This keeps your ticket rates accurate.</div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="text-escher-141416 dark:text-white text-xl leading-none font-medium">
                        {
                            position.rates.hodl.babylon.currentTicketRate +
                            position.rates.lp.babylon.currentTicketRate +
                            position.rates.hodl.union.currentTicketRate +
                            position.rates.lp.union.currentTicketRate
                        } tickets/day
                    </div>
                </div>
                <hr className="dark:border-escher-darkblue_border mt-4" />
                <Loading
                    currentTicketRate={position.rates.hodl.babylon.currentTicketRate}
                    curStick={curStick.hodl.babylon}
                    highUsd={position.rates.hodl.babylon.highUsd}
                    isTokenBalanceFetched={isTokenBalanceFetched}
                    lowUsd={position.rates.hodl.babylon.lowUsd}
                    nextTicketRate={position.rates.hodl.babylon.nextTicketRate}
                    setTestValue={setTestValue}
                    sticksCount={sticksCount}
                    testValue={testValue}
                    value={position.values.hodl.babylon}
                    title="eBABY Rate"
                />

                <Loading
                    currentTicketRate={position.rates.hodl.union.currentTicketRate}
                    curStick={curStick.hodl.union}
                    highUsd={position.rates.hodl.union.highUsd}
                    isTokenBalanceFetched={isTokenBalanceFetched}
                    lowUsd={position.rates.hodl.union.lowUsd}
                    nextTicketRate={position.rates.hodl.union.nextTicketRate}
                    setTestValue={setTestValue}
                    sticksCount={sticksCount}
                    testValue={testValue}
                    value={position.values.hodl.union}
                    title="eU Rate"
                />
                {/* 
                <Loading
                    currentTicketRate={position.rates.lp.babylon.currentTicketRate}
                    curStick={curStick.lp.babylon}
                    highUsd={position.rates.lp.babylon.highUsd}
                    isTokenBalanceFetched={isTokenBalanceFetched}
                    lowUsd={position.rates.lp.babylon.lowUsd}
                    nextTicketRate={position.rates.lp.babylon.nextTicketRate}
                    setTestValue={setTestValueLp}
                    sticksCount={sticksCount}
                    testValue={testValueLp}
                    value={position.values.lp.babylon}
                    title="eBaby LP Rate"
                />
                */}
                <Loading
                    currentTicketRate={position.rates.lp.union.currentTicketRate}
                    curStick={curStick.lp.union}
                    highUsd={position.rates.lp.union.highUsd}
                    isTokenBalanceFetched={isTokenBalanceFetched}
                    lowUsd={position.rates.lp.union.lowUsd}
                    nextTicketRate={position.rates.lp.union.nextTicketRate}
                    setTestValue={setTestValueLp}
                    sticksCount={sticksCount}
                    testValue={testValueLp}
                    value={position.values.lp.union}
                    title="eU LP Rate"
                />
            </div>
        </Card>
    );
}

interface LoadingProps {
    currentTicketRate: number
    curStick: number
    highUsd: number
    isTokenBalanceFetched: boolean
    lowUsd: number
    nextTicketRate: number
    sticksCount: number
    testValue: string
    title: string
    value: number
    setTestValue(val: string): void
}

const Loading = (props: LoadingProps) => {
    return (
        <div className="flex flex-col mt-8">
            <div className="text-gray-500 dark:text-white text-xs font-semibold">{props.title}</div>
            {debugRate &&
                <div className="flex flex-col gap-1 text-xs p-2 bg-slate-200 rounded my-2">
                    <div><b>debug</b></div>
                    <div className="flex gap-2">
                        <div>ebaby $value</div>
                        <input type="number" value={props.testValue} onChange={e => props.setTestValue(e.target.value)} className="border" />
                    </div>
                    <div>required ${props.highUsd - props.lowUsd}</div>
                </div>
            }

            <div className="flex relative mt-2">
                <div className="absolute inset-0 flex gap-px">
                    {[...Array(props.sticksCount)].map((_, k) =>
                        <div
                            key={k}
                            className={clsx(
                                "w-full h-full",
                                k < props.curStick ? "bg-escher-electricblue dark:bg-white" : "bg-gray-200 dark:bg-escher-darkblue_5",
                                k > 0 && k < 49 && "opacity-0"
                            )}
                        />
                    )}
                </div>
                <div className="w-full flex justify-between px-2">
                    <div className="flex flex-col gap-0.5 mb-2 justify-end">
                        <div className="text-xs text-escher-black dark:text-white font-medium leading-none">{props.currentTicketRate} ticket{props.currentTicketRate > 1 ? "s" : ""}/day</div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 mb-2">
                        <div className="text-[8px] text-escher-667085 dark:text-gray-400 leading-none">Next Rate</div>
                        <div className="text-xs text-escher-black dark:text-white font-medium leading-none">{props.nextTicketRate} ticket{props.nextTicketRate > 1 ? "s" : ""}/day</div>
                    </div>
                </div>
            </div>
            <div className="flex relative">
                <div className="w-full h-12 flex gap-px">
                    {[...Array(props.sticksCount)].map((_, k) =>
                        <div
                            key={k}
                            className={clsx(
                                "w-full h-full",
                                k < props.curStick ? "bg-escher-electricblue dark:bg-white" : "bg-gray-200 dark:bg-escher-darkblue_5",
                            )}
                        />
                    )}
                </div>
                <div
                    className="absolute inset-0 flex"
                >
                    <div style={{
                        width: `${props.curStick / props.sticksCount * 100}%`
                    }} />
                    {props.isTokenBalanceFetched &&
                        <div className="flex-1 flex items-center justify-center">
                            <div className="bg-escher-valencia text-white rounded-full px-1.5 py-[3px] leading-none text-xs font-medium">${formatNumber(props.highUsd - props.value)}</div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

function minimumUsdValueForTickets(tickets: number, config: LotteryConfig) {
    if (tickets <= 0) {
        return 0;
    }
    const maxBaseTickets =
        1 +
        Math.floor(
            (config.whale_usd - config.minimum_usd) /
            config.base_usd,
        );
    if (tickets <= maxBaseTickets) {
        return Math.ceil(
            config.minimum_usd + config.base_usd * (tickets - 1),
        );
    }
    return Math.ceil(
        config.whale_usd +
        config.base_usd *
        Math.pow(
            tickets - maxBaseTickets,
            1 / config.whale_damping_factor,
        ),
    );
}

function calculateLotteryTickets(usdValue: number, config: LotteryConfig) {
    if (usdValue < config.minimum_usd) {
        return 0;
    }
    if (usdValue <= config.whale_usd) {
        return 1 + Math.floor((usdValue - config.minimum_usd) / config.base_usd);
    }
    return 1 +
        Math.floor((config.whale_usd - config.minimum_usd) / config.base_usd) +
        Math.floor(Math.pow((usdValue - config.whale_usd) / config.base_usd, config.whale_damping_factor));
};

function approximateLotteryRates(
    hodlValue: { babylon: number, union: number },
    lpValue: { babylon: number, union: number },
    indexerRates: IndexerRates | undefined
) {
    const hodl = {
        babylon: {
            currentTicketRate: 0,
            nextTicketRate: 0,
            lowUsd: 0,
            highUsd: 0
        },
        union: {
            currentTicketRate: 0,
            nextTicketRate: 0,
            lowUsd: 0,
            highUsd: 0
        }
    }
    // HODL babylon
    hodl.babylon.currentTicketRate = (indexerRates?.babylon.hodl_avg_usd !== undefined && indexerRates?.babylon.hodl_avg_usd > 0) ?
        indexerRates?.babylon.hodl_ticket_rate :
        calculateLotteryTickets(hodlValue.babylon, HODL_LotteryConfig);
    hodl.babylon.nextTicketRate = hodl.babylon.currentTicketRate + 1;
    hodl.babylon.lowUsd = minimumUsdValueForTickets(hodl.babylon.currentTicketRate, HODL_LotteryConfig);
    hodl.babylon.highUsd = minimumUsdValueForTickets(hodl.babylon.nextTicketRate, HODL_LotteryConfig);

    // HODL union
    hodl.union.currentTicketRate = (indexerRates?.union.hodl_avg_usd !== undefined && indexerRates?.union.hodl_avg_usd > 0) ?
        indexerRates?.union.hodl_ticket_rate :
        calculateLotteryTickets(hodlValue.union, HODL_LotteryConfig);
    hodl.union.nextTicketRate = hodl.union.currentTicketRate + 1;
    hodl.union.lowUsd = minimumUsdValueForTickets(hodl.union.currentTicketRate, HODL_LotteryConfig);
    hodl.union.highUsd = minimumUsdValueForTickets(hodl.union.nextTicketRate, HODL_LotteryConfig);

    const lp = {
        babylon: {
            currentTicketRate: 0,
            nextTicketRate: 0,
            lowUsd: 0,
            highUsd: 0
        },
        union: {
            currentTicketRate: 0,
            nextTicketRate: 0,
            lowUsd: 0,
            highUsd: 0
        }
    }

    // LP babylon
    /* not tracking babylon lp
        lp.babylon.currentTicketRate = (indexerRates?.babylon.lp_avg_usd !== undefined && indexerRates?.babylon.lp_avg_usd > 0) ? indexerRates?.babylon.lp_ticket_rate : calculateLotteryTickets(lpValue.babylon, LP_LotteryConfig);
        lp.babylon.nextTicketRate = lp.babylon.currentTicketRate + 1;
        lp.babylon.lowUsd = minimumUsdValueForTickets(lp.babylon.currentTicketRate, LP_LotteryConfig);
        lp.babylon.highUsd = minimumUsdValueForTickets(lp.babylon.nextTicketRate, LP_LotteryConfig);
     */
    // LP union
    lp.union.currentTicketRate = (indexerRates?.union.lp_avg_usd !== undefined && indexerRates?.union.lp_avg_usd > 0) ? indexerRates?.union.lp_ticket_rate : calculateLotteryTickets(lpValue.union, LP_LotteryConfig);
    lp.union.nextTicketRate = lp.union.currentTicketRate + 1;
    lp.union.lowUsd = minimumUsdValueForTickets(lp.union.currentTicketRate, LP_LotteryConfig);
    lp.union.highUsd = minimumUsdValueForTickets(lp.union.nextTicketRate, LP_LotteryConfig);

    return {
        hodl,
        lp
    }
}

export default Position;