"use client";

import ButtonLink from "@/components/global/buttonLink";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { URL } from "@/config/app";
import useBabylonData from "@/hooks/useBabylonData";
import { useUnionData } from "@/hooks/useUnionData";
import { formatNumber } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

const defaultTransition = { duration: 0.3, ease: "easeOut" };

const LiquidTokens = () => {
    const [activeToken, setActiveToken] = useState<'tia' | 'union' | 'baby' | 'ip'>('baby');
    const tokenState = useMemo(() => {
        return {
            tia: activeToken === 'tia',
            union: activeToken === 'union',
            baby: activeToken === 'baby',
            ip: activeToken === 'ip',
        };
    }, [activeToken]);

    const queryBabylonData = useBabylonData();
    const queryUnionData = useUnionData();

    return (
        <div className="bg-primary text-white mt-28">
            <div className="container mx-auto flex flex-col items-center py-4 md:py-14 px-4 md:px-0">
                <div className="w-full flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
                    <div className="flex flex-col">
                        <div
                            className="font-funnel-display font-semibold text-xl md:text-5xl"
                            onClick={() => console.log({ queryUnionData: queryUnionData.data })}
                        >The First Chain-Abstracted Liquid<br />Staking Tokens</div>
                        <div className="text-sm md:text-lg mt-2 md:mt-4">LST that are "native" on (m)ANY Chain(s)</div>
                    </div>
                    <ButtonLink
                        title="View more"
                        url={URL.appStaking}
                        postImage="/icons/arrow-up-right-03.svg"
                        className="bg-custom-e1e2ff text-primary"
                    />
                </div>

                <div className="flex flex-col gap-4 mt-8">
                    <LiquidCard
                        lst="babylon"
                        tokenImage="/images/token/e-babylon.svg"
                        symbol="eBABY"
                        chain="Babylon"
                        isOpen={tokenState.baby}
                        enabled={true}
                        onClick={() => setActiveToken("baby")}
                        detail={{
                            apr: queryBabylonData.apr,
                            tvl: queryBabylonData.tvl,
                            ratio: queryBabylonData.ratio,
                            price: queryBabylonData.price,
                            trade: queryBabylonData.dailyTrade ? `$${formatNumber(queryBabylonData.dailyTrade)}` : undefined,
                            inflation: queryBabylonData.inflation ? `${formatNumber(queryBabylonData.inflation * 100)}%` : undefined
                        }}
                    />

                    <LiquidCard
                        lst="union"
                        tokenImage="/images/token/e-union.svg"
                        symbol="eU"
                        chain="Union"
                        isOpen={tokenState.union}
                        enabled={true}
                        onClick={() => setActiveToken("union")}
                        detail={{
                            apr: queryUnionData.data?.apr,
                            tvl: queryUnionData.data?.tvl,
                            ratio: queryUnionData.data?.ratio,
                            price: queryUnionData.data?.price,
                            // trade: queryBabylonData.dailyTrade ? `$${formatNumber(queryBabylonData.dailyTrade)}` : undefined,
                            inflation: queryUnionData.data?.inflation
                        }}
                    />

                    {/* 
                    <LiquidCard
                        tokenImage="/images/token/e-story.svg"
                        symbol="eIP"
                        chain="Story"
                        isOpen={tokenState.ip}
                        enabled={false}
                        onClick={() => setActiveToken("ip")}
                        detail={{
                            ratio: "1:1.0022"
                        }}
                    /> */}
                </div>
            </div>
        </div>
    );
}

export default LiquidTokens;

const LiquidCard = (props: {
    lst: 'babylon' | 'union'
    symbol: string
    chain: string
    tokenImage: string
    isOpen: boolean
    enabled: boolean
    onClick(): void
    detail?: {
        apr?: string
        tvl?: string
        ratio?: string
        price?: string
        trade?: string
        inflation?: string
    }
}) => {
    const BgImage = () => {
        switch (props.chain) {
            case "Union":
                return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-union.jpg')]`}></div>;
            case "Babylon":
                return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-baby.jpg')]`}></div>;
            case "Celestia":
                return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-tia.jpg')]`}></div>;
        }
        return <></>;
    }

    return (
        <motion.div
            initial={{ paddingLeft: "24px", paddingRight: "24px" }}
            animate={{
                paddingLeft: props.isOpen ? 0 : "24px",
                paddingRight: props.isOpen ? 0 : "24px",
            }}
            transition={defaultTransition}
            className={`w-full md:w-[460px] flex justify-center px-6 ${props.isOpen ? "" : "cursor-pointer"}`}
            onClick={props.onClick}
        >
            <motion.div
                initial={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "8px", paddingBottom: "8px" }}
                animate={{
                    paddingLeft: props.isOpen ? "24px" : "16px",
                    paddingRight: props.isOpen ? "24px" : "16px",
                    paddingTop: props.isOpen ? "24px" : "8px",
                    paddingBottom: props.isOpen ? "24px" : "8px",
                }}
                transition={defaultTransition}
                className="group relative w-full rounded-2xl bg-white shadow-lg shadow-escher_DEDFFF flex flex-col"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: props.isOpen ? 100 : 0 }}
                    transition={defaultTransition}
                    className="flex flex-col"
                >
                    <BgImage />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary rounded-2xl opacity-0 group-hover:opacity-5 transition-all" />
                </motion.div>

                <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <motion.img
                            initial={{ height: 36, width: 36 }}
                            animate={{ height: props.isOpen ? 48 : 36, width: props.isOpen ? 48 : 36 }}
                            transition={defaultTransition}
                            src={props.tokenImage} width={48} height={48}
                        />
                        <div className="flex flex-col items-start">
                            <div className="text-xl font-semibold text-text">{props.symbol}</div>
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: props.isOpen ? "auto" : 0, opacity: props.isOpen ? 1 : 0 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={defaultTransition}
                                className="text-sm text-primary"
                            >
                                {props.chain}
                            </motion.div>
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        {props.isOpen ?
                            <motion.img
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ ...defaultTransition }}
                                src="/images/logo-blue.svg" alt="Escher" width={37} height={37}
                            />
                            :
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 40 }}
                                transition={{ ...defaultTransition }}
                                className="text-sm text-primary"
                            >
                                {props.chain}
                            </motion.div>
                        }
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: props.isOpen ? "auto" : 0, opacity: props.isOpen ? 1 : 0 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={defaultTransition}
                    className="flex justify-between items-end text-xs font-semibold z-10 overflow-hidden"
                >
                    <div className="self-start grid grid-cols-[1fr_auto_auto] gap-y-[6px] gap-x-3 text-start mt-14">
                        <img src="/icons/chart-03-blue.svg" width={14} height={14} />
                        <div className="text-primary">APR</div>
                        {props.detail?.apr ?
                            <div className="text-text">{props.detail?.apr}</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        <img src="/icons/square-lock-check-02-blue.svg" width={14} height={14} />
                        <div className="text-primary">TVL</div>
                        {props.detail?.tvl ?
                            <div className="text-text">{props.detail?.tvl}</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        <img src="/icons/coins-swap-blue.svg" width={14} height={14} />
                        <div className="text-primary">Ratio</div>
                        {props.detail?.ratio ?
                            <div className="text-text">{props.detail?.ratio}</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        <img src="/icons/sale-tag-02-blue.svg" width={14} height={14} />
                        <div className="text-primary">Token Price</div>
                        {props.detail?.price ?
                            <div className="text-text">{props.detail?.price}</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        <img src="/icons/trade-up-blue.svg" width={14} height={14} />
                        <div className="text-primary">Daily Trade</div>
                        {props.detail?.trade ?
                            <div className="text-text">{props.detail?.trade}</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        <img src="/icons/inflation.svg" width={14} height={14} />
                        <div className="text-primary">Inflation</div>
                        {props.detail?.inflation ?
                            <div className="text-text">{props.detail?.inflation}</div>
                            :
                            <LdrsAnimation size={16} />
                        }
                    </div>

                    {props.lst === "babylon" &&
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center">
                                <img src={"/images/liquid-stake/apps-1.svg"} width={24} height={24} alt="" className="z-[8]" />
                                <img src={"/images/liquid-stake/apps-4.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[7]" />
                                <img src={"/images/liquid-stake/apps-osmosis.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[6]" />
                                {/* <img src={"/images/liquid-stake/apps-2.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[7]" />
                            <img src={"/images/liquid-stake/apps-3.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[6]" />
                            <img src={"/images/liquid-stake/apps-4.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[5]" />
                            <img src={"/images/liquid-stake/apps-5.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[4]" />
                            <img src={"/images/liquid-stake/apps-6.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[3]" />
                            <img src={"/images/liquid-stake/apps-7.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[2]" />
                            <img src={"/images/liquid-stake/apps-8.svg"} width={24} height={24} alt="" className="-ml-1.5 z-[1]" /> */}
                            </div>
                        </div>
                    }
                </motion.div>

                <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: props.isOpen ? 0 : 0.3 }}
                    transition={defaultTransition}
                    className="absolute inset-0 bg-primary"
                />

                {!props.enabled &&
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: props.isOpen ? 0.8 : 0 }}
                        transition={defaultTransition}
                        className="absolute inset-0 bg-primary flex items-center justify-center z-20"
                    >
                        <div className="bg-blue-500 rounded-full px-4 py-1 text-sm font-medium">Coming Soon</div>
                    </motion.div>
                }
            </motion.div>
        </motion.div>
    );
}