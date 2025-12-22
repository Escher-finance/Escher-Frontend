import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import SwapTower from "@/components/modal/swap/tower/swapTower";
import { useSkipSimulation } from "@/hooks/useSkip";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { Defi, DefiSwap } from "@/types/defi";
import { RouteRequest, SkipClient } from "@skip-go/client";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
    defi: Defi
    swap: DefiSwap
    isCosmosConnected: boolean
    skipClient?: SkipClient
}

const TowerSwap = (props: Props) => {
    const routeRequest = useMemo((): RouteRequest | undefined => {
        if (
            !props.swap.hasPriceRatio ||
            !props.swap.tokenA.denom ||
            !props.swap.tokenB.denom
        ) return undefined;

        return {
            swapVenues: [
                {
                    chainID: props.defi.chain.id.toString(),
                    name: "babylon-tower",
                },
            ],
            sourceAssetDenom: `${props.swap.tokenA.isCw20 ? "cw20:" : ""}${props.swap.tokenA.denom}`,
            sourceAssetChainID: props.swap.tokenA.chain.id.toString(),
            destAssetDenom: `${props.swap.tokenB.isCw20 ? "cw20:" : ""}${props.swap.tokenB.denom}`,
            destAssetChainID: props.swap.tokenB.chain.id.toString(),
            amountIn: formatDecimal(1, props.swap.tokenA.decimals).toFixed(0),
            allowSwaps: true,
            allowUnsafe: true,
        };
    }, [props.swap, props.defi]);

    const simulation = useSkipSimulation({
        skipClient: props.skipClient,
        routeRequest
    });

    const priceRatio = useMemo(() => {
        if (!simulation.data?.amountOut) return undefined;

        return formatDecimal(Number(simulation.data?.amountOut), -props.swap.tokenB.decimals);
    }, [simulation.data]);

    return (
        <Card className="gap-0 p-4 dark:bg-escher-dark_0c203d">
            <div className="flex flex-col dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg">
                <div className="flex items-center py-2.5 leading-none">
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_2 text-sm font-medium px-2 py-1 leading-none rounded">SWAP</div>
                    </div>
                    <div className="h-5 border-l border-escher-dedfff dark:border-escher-darkblue_border" />
                    <div className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-escher-text2 dark:text-white">
                        <Image alt="" src={props.defi.logoURI} className="w-3.5 h-3.5" width={14} height={14} />
                        <div>{props.defi.name}</div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-4 border-t border-b border-escher-dedfff dark:border-escher-darkblue_border bg-linear-to-r from-white dark:from-escher-darkblue via-white dark:via-escher-darkblue to-[#FCF9F0]">
                    {props.swap.tokenA.icon &&
                        <TokenChain token={props.swap.tokenA} />
                    }
                    <div className="flex flex-col">
                        <div className="font-semibold text-black dark:text-white">{props.swap.tokenA.symbol}</div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 leading-none py-2.5 font-semibold text-sm dark:text-white">
                    <div>1 {props.swap.tokenA.symbol}</div>
                    {props.swap.tokenA.icon &&
                        <Image alt="" src={props.swap.tokenA.icon} className="w-4 h-4" width={16} height={16} />
                    }
                    <div>≈</div>
                    {priceRatio ?
                        <div>{formatNumber(priceRatio, true, 4)} {props.swap.tokenB.symbol}</div>
                        :
                        <LdrsAnimation size={16} />
                    }
                    {props.swap.tokenB.icon &&
                        <Image alt="" src={props.swap.tokenB.icon} className="w-4 h-4" width={16} height={16} />
                    }
                </div>
            </div>

            <SwapTower
                isApps={true}
            />

            <div className="text-xs text-escher-777e90 text-center mt-4">LP interaction executed vie <Link href={props.defi.link} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">{props.defi.name}</Link> DEX.</div>
        </Card>
    );
}

export default TowerSwap;