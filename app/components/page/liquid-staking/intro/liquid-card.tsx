import ComingSoon from "@/components/global/comingSoon"
import Icon from "@/components/global/icons"
import LdrsAnimation from "@/components/global/ldrsAnimation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"

export const LiquidCard = (props: {
    onNext?(): void
    symbol: string
    chain: string
    tokenImage: string
    tokenImageDark: string
    enabled: boolean
    detail?: {
        apr?: number
        tvl?: number
        ratio?: string
        price?: string
        tradeDatas?: { logo: string, amount: number }[]
        inflation?: string
    }
    tooltip?: {
        title1: string
        subtitle1: string
        title2: string
        subtitle2: string
        link1Text: string
        link1Url: string
        link2Text: string
        link2Url: string
    }
    themeIsDark: boolean
}) => {

    const tokenIcon = useMemo(() => {
        return props.themeIsDark ? props.tokenImageDark : props.tokenImage;
    }, [props.themeIsDark, props.tokenImage, props.tokenImageDark]);

    const BgImage = useMemo(() => {
        if (props.themeIsDark) {
            switch (props.chain) {
                case "Union":
                    return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-union-dark.jpg')]`}></div>;
                case "Babylon":
                    return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-baby-dark.jpg?v=1')]`}></div>;
                case "Celestia":
                    return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-tia.jpg')]`}></div>;
            }
        } else {
            switch (props.chain) {
                case "Union":
                    return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-union.jpg')]`}></div>;
                case "Babylon":
                    return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-baby.jpg')]`}></div>;
                case "Celestia":
                    return <div className={`absolute inset-0 z-0 rounded-2xl bg-cover bg-no-repeat bg-[url('/images/liquid-stake/card-tia.jpg')]`}></div>;
            }
        }
        return <></>;
    }, [props.chain, props.themeIsDark]);

    const totalTrade = useMemo(() => {
        return props.detail?.tradeDatas?.reduce((sum, cur) => sum += cur.amount, 0);
    }, [props.detail?.tradeDatas]);

    return (
        <div className="relative">
            <div
                className="group relative w-[460px] rounded-2xl p-6 bg-white dark:bg-transparent shadow-lg shadow-escher-dedfff dark:shadow-none flex flex-col cursor-pointer"
                onClick={props.onNext}
            >
                {BgImage}
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-escher-electricblue rounded-2xl opacity-0 group-hover:opacity-5 transition-all" />

                <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <Image alt="" src={tokenIcon} width={48} height={48} />
                        <div className="flex flex-col items-start">
                            <div className="text-xl font-semibold text-escher-black dark:text-white">{props.symbol}</div>
                            <div className="text-sm text-escher-electricblue dark:text-white">{props.chain}</div>
                        </div>
                    </div>
                    {props.tooltip &&
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger className="text-white bg-escher-electricblue dark:bg-gray-500 bg-opacity-[0.23] rounded-full p-1">
                                    <Icon type="BsExclamationCircle" />
                                </TooltipTrigger>
                                <TooltipContent
                                    className="flex flex-col p-6 leading-none bg-white dark:bg-escher-darkblue rounded-2xl text-escher-black dark:text-white max-w-[432px] shadow-md bg-[url('/images/liquid-stake/tooltip-bg.jpg')] dark:bg-none bg-position-[100%_100%] bg-no-repeat dark:border dark:border-escher-darkblue_4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="font-semibold text-base">{props.tooltip.title1}</div>
                                    <div className="mt-1 text-xs text-escher-text4 dark:text-white">{props.tooltip.subtitle1}</div>
                                    <div className="mt-6 font-semibold text-base">{props.tooltip.title2}</div>
                                    <div className="mt-1 text-xs text-escher-text4 dark:text-white">{props.tooltip.subtitle2}</div>
                                    <div className="flex items-center justify-between text-escher-link font-medium mt-10">
                                        <Link href={props.tooltip.link1Url} target="_blank" className="flex items-center gap-1 underline underline-offset-2">
                                            <div>{props.tooltip.link1Text}</div>
                                            <Icon type="FiArrowUpRight" />
                                        </Link>
                                        <Link href={props.tooltip.link2Url} target="_blank" className="flex items-center gap-1 underline underline-offset-2">
                                            <div>{props.tooltip.link2Text}</div>
                                            <Icon type="FiArrowUpRight" />
                                        </Link>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    }
                </div>

                <div className="flex flex-col text-xs font-semibold mt-14 z-10">
                    <div className="self-start grid grid-cols-[1fr_auto_auto] gap-y-1.5 gap-x-3 text-start">
                        {props.themeIsDark ?
                            <Image alt="" src="/icons/chart-03-white.svg" width={14} height={14} /> :
                            <Image alt="" src="/icons/chart-03-blue.svg" width={14} height={14} />
                        }
                        <div className="text-escher-electricblue dark:text-white">APR</div>
                        {props.detail?.apr ?
                            <div className="text-escher-black dark:text-white">{props.detail?.apr.toFixed(2)}%</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        {props.themeIsDark ?
                            <Image alt="" src="/icons/square-lock-check-02-white.svg" width={14} height={14} /> :
                            <Image alt="" src="/icons/square-lock-check-02-blue.svg" width={14} height={14} />
                        }
                        <div className="text-escher-electricblue dark:text-white">TVL</div>
                        {props.detail?.tvl ?
                            <div className="text-escher-black dark:text-white">${formatNumber(props.detail?.tvl)}</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        {props.themeIsDark ?
                            <Image alt="" src="/icons/coins-swap-white.svg" width={14} height={14} /> :
                            <Image alt="" src="/icons/coins-swap-blue.svg" width={14} height={14} />
                        }
                        <div className="text-escher-electricblue dark:text-white">Ratio</div>
                        {props.detail?.ratio ?
                            <div className="text-escher-black dark:text-white">{props.detail?.ratio}</div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        {props.themeIsDark ?
                            <Image alt="" src="/icons/sale-tag-02-white.svg" width={14} height={14} /> :
                            <Image alt="" src="/icons/sale-tag-02-blue.svg" width={14} height={14} />
                        }
                        <div className="text-escher-electricblue dark:text-white">Token Price</div>
                        <div className="text-escher-black dark:text-white">{props.detail?.price ? `$${props.detail?.price}` : "-"}</div>

                        {props.themeIsDark ?
                            <Image alt="" src="/icons/trade-up-white.svg" width={14} height={14} /> :
                            <Image alt="" src="/icons/trade-up-blue.svg" width={14} height={14} />
                        }
                        <div className="text-escher-electricblue dark:text-white">Daily Trade</div>
                        {totalTrade ?
                            <div className="flex items-center gap-1">
                                <div className="text-escher-black dark:text-white">${formatNumber(totalTrade, true, 2, "M")}</div>

                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Icon type="BsExclamationCircle" className="text-escher-electricblue dark:text-white" size="sm" />
                                        </TooltipTrigger>
                                        <TooltipContent className="flex flex-col gap-2 bg-white text-escher-text2 shadow-lg border p-4">
                                            <div className="text-escher-electricblue font-semibold text-xs">Breakdown</div>
                                            {props.detail?.tradeDatas?.map((v, k) =>
                                                <div
                                                    key={k}
                                                    className="flex items-center gap-1 border border-escher-dedfff rounded-full p-1"
                                                >
                                                    <Image alt="" src={v.logo} className="w-4 h-4" width={16} height={16} />
                                                    <div className="text-xs text-escher-text2 font-semibold">${formatNumber(v.amount)}</div>
                                                </div>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            :
                            <LdrsAnimation size={16} />
                        }

                        {props.themeIsDark ?
                            <Image alt="" src="/icons/trade-up-white.svg" width={14} height={14} /> :
                            <Image alt="" src="/icons/inflation.svg" width={14} height={14} />
                        }
                        <div className="text-escher-electricblue dark:text-white">Inflation</div>
                        {props.detail?.inflation ?
                            <div className="text-escher-black dark:text-white">{props.detail?.inflation}</div>
                            :
                            <LdrsAnimation size={16} />
                        }
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <div className="bg-escher-dedfff dark:bg-gray-500/40 rounded-full py-1 pl-1 pr-2 flex gap-1 text-escher-electricblue dark:text-white text-xs font-medium">
                            <Image src={"/images/points/escher.svg"} alt="" width={14} height={14} />
                            {/* <Image src={"/images/points/union.svg"} alt="" width={14} height={14} /> */}
                            <Image src={props.themeIsDark ? "/images/points/flash-white.svg" : "/images/points/flash.svg"} alt="" width={14} height={14} />
                            <div>Points</div>
                        </div>

                        <Defis chain={props.chain} />
                    </div>
                </div>
            </div>

            {!props.enabled &&
                <ComingSoon size="lg" />
            }
        </div>
    );
}

const Defis = (props: { chain: string }) => {
    switch (props.chain) {
        case "Babylon":
            return (
                <div className="flex items-center">
                    <Image alt="" src={"/images/liquid-stake/apps-4.svg"} width={24} height={24} className="z-7" />
                    <div className="w-6 h-6 -ml-1.5 z-6 bg-white p-[3px] rounded-full flex items-center justify-center">
                        <div>
                            <Image alt="" src={"https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg"} width={24} height={24} />
                        </div>
                    </div>
                </div>
            );
        case "OtherFutureTemplate":
            return (
                <div className="flex items-center">
                    <Image alt="" src={"/images/liquid-stake/apps-1.svg"} width={24} height={24} className="z-8" />
                    <Image alt="" src={"/images/liquid-stake/apps-2.svg"} width={24} height={24} className="-ml-1.5 z-7" />
                    <Image alt="" src={"/images/liquid-stake/apps-3.svg"} width={24} height={24} className="-ml-1.5 z-6" />
                    <Image alt="" src={"/images/liquid-stake/apps-4.svg"} width={24} height={24} className="-ml-1.5 z-5" />
                    <Image alt="" src={"/images/liquid-stake/apps-5.svg"} width={24} height={24} className="-ml-1.5 z-4" />
                    <Image alt="" src={"/images/liquid-stake/apps-6.svg"} width={24} height={24} className="-ml-1.5 z-3" />
                    <Image alt="" src={"/images/liquid-stake/apps-7.svg"} width={24} height={24} className="-ml-1.5 z-2" />
                    <Image alt="" src={"/images/liquid-stake/apps-8.svg"} width={24} height={24} className="-ml-1.5 z-1" />
                </div>
            );
    }
    return <></>;
}
