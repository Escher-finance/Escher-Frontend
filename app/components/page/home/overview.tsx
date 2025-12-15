import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { useTheme } from "@/components/providers/themeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/configs/app";
import { EscherDefi } from "@/hooks/defi/useDefi";
import { useUnionLstData } from "@/hooks/liquidStakingContract/union/lstData";
import { formatNumber } from "@/lib/utils";
import { Apr, CustomToken, Liquidity, Tokenomics } from "@/types/chain";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
    defis: EscherDefi
    apr?: Apr
    liquidity?: Liquidity
    tokenomics?: Tokenomics
    tokens: CustomToken[]
}

const Overview = (props: Props) => {
    const { themeIsDark } = useTheme();
    const queryUnionLstData = useUnionLstData();

    {/* Idle */ }
    const positions = useMemo(() => props.tokens.filter(v => v.isStakeAble && Number(v.balance?.value ?? 0) > 0), [props.tokens]);

    const positionsImages = useMemo(() => {
        return [...new Set(positions.map(v => v.icon).filter(Boolean))];
    }, [positions]);

    const positionsValue = useMemo(() => {
        return positions?.reduce((sum, t) => sum += (t.balance?.dollarValue ?? 0), 0);
    }, [positions]);
    // =================================================================================

    {/* Liquid */ }
    const [liquids, liquidsImages, liquidsValue] = useMemo(() => {
        const tokens = props.tokens.filter(v => v.isLiquid);
        return [
            tokens,
            [...new Set(tokens.map(v => v.icon).filter(Boolean))],
            tokens?.reduce((sum, t) => sum += (t.balance?.dollarValue ?? 0), 0)
        ];
    }, [props.tokens]);

    const [liquidTvls, liquidTotalTvl] = useMemo(() => {
        const baby = props.tokens.filter(t => t.isLiquid && t.lst?.includes("babylon"))?.reduce((sum, t) => {
            return sum += t.isLiquid ? (t.tvl ?? 0) : 0;
        }, 0);

        const union = queryUnionLstData.tvl ?? 0;

        return [
            {
                babylon: {
                    name: "eBABY",
                    logo: "/images/token/e-babylon.svg",
                    value: baby
                },
                union: {
                    name: "eU",
                    logo: "/images/token/e-union.svg",
                    value: union
                },
            },
            baby + union
        ];
    }, [props.tokens, queryUnionLstData]);
    // =================================================================================

    {/* DEFI */ }
    const totalDefisPosition = useMemo(() => {
        // if (
        //     !props.defis.uniswap.info.tvl ||
        //     !props.defis.osmosis.info.tvl ||
        //     props.defis.uniswap.info.tvl <= 0 ||
        //     props.defis.osmosis.info.tvl <= 0
        // ) return undefined;

        return (
            (props.defis.uniswap.info.position ?? 0) +
            (props.defis.osmosis.info.position ?? 0)
        );
    }, [props.defis]);

    const totalDefisTvl = useMemo(() => {
        return (
            (props.defis.osmosis.info.tvl ?? 0) +
            (props.defis.uniswap.info.tvl ?? 0)
        );
    }, [props.defis.osmosis.info.tvl, props.defis.uniswap.info.tvl]);

    return (
        <div className="w-full flex gap-6">

            {/* Idle */}
            <Card className="flex-1 px-6 py-[22px] bg-[linear-gradient(116deg,#FFF1D6_0%,#FFF_31.72%)] dark:bg-[linear-gradient(135deg,#FFF1D6_0%,#071B39_31.72%)]">
                <div className="w-full flex items-center justify-between">
                    <div
                        className="text-escher-electricblue dark:text-white font-semibold"
                        onClick={() => {
                            console.log({
                                tokens: props.tokens,
                                tokenomics: props.tokenomics,
                                liquidity: props.liquidity,
                                defis: props.defis,
                                tokensPositions: positions,
                                tokensPositionsImages: positionsImages
                            })
                        }}
                    >My Idle Tokens</div>
                    <motion.img
                        src={themeIsDark ? "/images/point-program-transparent-small.png" : "/images/point-program-transparent-v2.png"}
                        className="w-9 h-9"
                    />
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <div className="text-escher-text2 dark:text-white text-3xl font-semibold leading-none">${formatNumber(positionsValue)}</div>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                                <Icon type="FiInfo" className="text-escher-electricblue dark:text-escher-electricblue_dark_mode text-base" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-escher-text2 shadow-lg border p-4 flex flex-col gap-2">
                                <div className="text-escher-electricblue font-semibold self-center text-sm">Breakdown</div>
                                <div className="w-full flex flex-col gap-1">
                                    {positions.map((t, k) => (
                                        <div key={k} className="flex items-center gap-2 w-full">
                                            <TokenChain token={t} />
                                            <div className="font-semibold flex-1 mr-10 text-sm">{t.symbol}</div>
                                            <div className="flex flex-col items-end">
                                                <div className="font-semibold text-xs">{formatNumber(t.balance?.formattedBalance ?? 0)}</div>
                                                <div className="font-medium text-gray-500 text-xs">${formatNumber(t.balance?.dollarValue ?? 0)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex mt-4">
                    {positionsImages.map((v, k) =>
                        <Image key={k} src={v ?? ""} width={24} height={24} alt="" style={{ marginLeft: `-6px`, zIndex: (positions.length + 10) - k }} />
                    )}
                </div>
            </Card>

            {/* Liquid */}
            <Card className="flex-1 px-6 py-[22px] bg-[linear-gradient(116deg,#D5D6FF_0%,#FFF_31.72%)] dark:bg-[linear-gradient(135deg,#FFF1D6_0%,#071B39_31.72%)]">
                <div className="w-full flex items-center justify-between">
                    <div
                        className="text-escher-electricblue dark:text-white font-semibold"
                        onClick={() => {
                            console.log({
                                liquids,
                                liquidsImages,
                                liquidsValue
                            })
                        }}
                    >My LST Position</div>
                    <motion.img
                        src={themeIsDark ? "/images/point-program-transparent-small.png" : "/images/point-program-transparent-v2.png"}
                        className="w-9 h-9"
                        animate={{
                            rotate: 360
                        }}
                        transition={{
                            rotate: { repeat: Infinity, duration: 20, ease: "linear" },
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <div className="text-escher-text2 dark:text-white text-3xl font-semibold leading-none">${formatNumber(liquidsValue)}</div>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                                <Icon type="FiInfo" className="text-escher-electricblue dark:text-escher-electricblue_dark_mode text-base" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-escher-text2 shadow-lg border p-4 flex flex-col gap-2">
                                <div className="text-escher-electricblue font-semibold self-center text-sm">Breakdown</div>
                                <div className="w-full flex flex-col gap-1">
                                    {liquids.map((t, k) => (
                                        <div key={k} className="flex items-center gap-2 w-full">
                                            <TokenChain token={t} />
                                            <div className="font-semibold flex-1 mr-10 text-sm">{t.symbol}</div>
                                            <div className="flex flex-col items-end">
                                                <div className="font-semibold text-xs">{formatNumber(t.balance?.formattedBalance ?? 0)}</div>
                                                <div className="font-medium text-gray-500 text-xs">${formatNumber(t.balance?.dollarValue ?? 0)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex">
                        {liquidsImages.map((v, k) =>
                            <Image key={k} src={v ?? ""} width={24} height={24} alt="" style={{ marginLeft: `-6px`, zIndex: (positions.length + 10) - k }} />
                        )}
                    </div>

                    {liquidTotalTvl > 0 ?
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger className="flex items-center gap-2 text-sm text-escher-electricblue bg-blue-50 border border-escher-electricblue_light1 rounded-full px-2 py-0.5 font-medium self-start">
                                    <Image src="/icons/square-lock-check-02-blue.svg" alt="tvl" width={14} height={14} />
                                    <div>TVL ${formatNumber(liquidTotalTvl)}</div>
                                    <Icon type="FiInfo" className="text-escher-electricblue text-base" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-escher-text2 shadow-lg border p-4 flex flex-col gap-2">
                                    <div className="text-escher-electricblue font-semibold self-center text-sm">Breakdown</div>
                                    <div className="w-full flex flex-col gap-1">
                                        {/* Babylon */}
                                        <div className="flex items-center gap-2 w-full">
                                            <Image src={liquidTvls.babylon.logo} alt="babylon tvl" width={24} height={24} />
                                            <div className="font-semibold flex-1 mr-10 text-sm">{liquidTvls.babylon.name}</div>
                                            <div className="font-semibold text-xs">${formatNumber(liquidTvls.babylon.value)}</div>
                                        </div>
                                        {/* Union */}
                                        <div className="flex items-center gap-2 w-full">
                                            <Image src={liquidTvls.union.logo} alt="union tvl" width={24} height={24} />
                                            <div className="font-semibold flex-1 mr-10 text-sm">{liquidTvls.union.name}</div>
                                            <div className="font-semibold text-xs">${formatNumber(liquidTvls.union.value)}</div>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        :
                        <>
                            {props.liquidity?.amount &&
                                <LdrsAnimation />
                            }
                        </>
                    }
                </div>
            </Card>

            {/* Defi */}
            {!APP_CONFIG.networkIsTestnet &&
                <Card className="flex-1 px-6 py-[22px] bg-[linear-gradient(116deg,#D7FFD6_0%,#FFF_31.72%)] dark:bg-[linear-gradient(135deg,#D7FFD6_0%,#071B39_31.72%)]">
                    <div className="w-full flex items-center justify-between">
                        <div
                            className="text-escher-electricblue dark:text-white font-semibold"
                            onClick={() => console.log({
                                totalDefisTvl: totalDefisPosition,
                                defis: props.defis
                            })}
                        >My DeFi Position</div>
                        <motion.img
                            src={themeIsDark ? "/images/point-program-transparent-small.png" : "/images/point-program-transparent-v2.png"}
                            className="w-9 h-9"
                            animate={{
                                rotate: 360
                            }}
                            transition={{
                                rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                            }}
                        />
                    </div>

                    <div className="flex items-center mt-4 gap-2">
                        <div className="text-escher-text2 dark:text-white text-3xl font-semibold leading-none">${formatNumber(totalDefisPosition)}</div>
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger>
                                    <Icon type="FiInfo" className="text-escher-electricblue dark:text-escher-electricblue_dark_mode text-base" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-escher-text2 shadow-lg border p-4 flex flex-col gap-2">
                                    <div className="text-escher-electricblue font-semibold self-center text-sm">Breakdown</div>
                                    <div className="w-full flex flex-col gap-1">
                                        {/* Osmosis */}
                                        <div className="flex items-center gap-2 w-full">
                                            <Image src={props.defis.osmosis.info.logoURI} alt="osmosis" width={24} height={24} />
                                            <div className="font-semibold flex-1 mr-10 text-sm">{props.defis.osmosis.info.name}</div>
                                            <div className="font-semibold text-xs">${formatNumber(props.defis.osmosis.info.position ?? 0)}</div>
                                        </div>
                                        {/* Uniswap */}
                                        <div className="flex items-center gap-2 w-full">
                                            <Image src={props.defis.uniswap.info.logoURI} alt="uniswap" width={24} height={24} />
                                            <div className="font-semibold flex-1 mr-10 text-sm">{props.defis.uniswap.info.name}</div>
                                            <div className="font-semibold text-xs">${formatNumber(props.defis.uniswap.info.position ?? 0)}</div>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <div className="flex">
                            <Image src={"/images/apps/app-uniswap-circle-2.svg"} width={24} height={24} alt="" className="z-6" />
                            <Image src={"/images/apps/app-osmosis-circle-2.svg"} width={24} height={24} alt="" className="z-6" />
                        </div>

                        {totalDefisTvl > 0 ?
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger className="flex items-center gap-2 text-sm text-escher-electricblue bg-blue-50 border border-escher-electricblue_light1 rounded-full px-2 py-0.5 font-medium self-start">
                                        <Image src="/icons/square-lock-check-02-blue.svg" alt="" width={14} height={14} />
                                        <div>TVL ${formatNumber(totalDefisTvl)}</div>
                                        <Icon type="FiInfo" className="text-escher-electricblue text-base" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white text-escher-text2 shadow-lg border p-4 flex flex-col gap-2">
                                        <div className="text-escher-electricblue font-semibold self-center text-sm">Breakdown</div>
                                        <div className="w-full flex flex-col gap-1">
                                            {/* Osmosis */}
                                            <div className="flex items-center gap-2 w-full">
                                                <Image src={props.defis.osmosis.info.logoURI} alt="" className="w-6 h-6" width={24} height={24} />
                                                <div className="font-semibold flex-1 mr-10 text-sm">{props.defis.osmosis.info.name}</div>
                                                <div className="font-semibold text-xs">${formatNumber(props.defis.osmosis.info.tvl ?? 0)}</div>
                                            </div>
                                            {/* Uniswap */}
                                            <div className="flex items-center gap-2 w-full">
                                                <Image src={props.defis.uniswap.info.logoURI} alt="" className="w-6 h-6" width={24} height={24} />
                                                <div className="font-semibold flex-1 mr-10 text-sm">{props.defis.uniswap.info.name}</div>
                                                <div className="font-semibold text-xs">${formatNumber(props.defis.uniswap.info.tvl ?? 0)}</div>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            :
                            <LdrsAnimation />
                        }
                    </div>
                </Card >
            }
        </div >
    );
}

export default Overview;