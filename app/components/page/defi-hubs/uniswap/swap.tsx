import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import SwapUniswap from "@/components/modal/swap/uniswap/swapUniswap";
import { useUniswapRoute } from "@/hooks/useUniswap";
import { formatNumber } from "@/lib/utils";
import { Defi, DefiSwap } from "@/types/defi";
import { SkipClient } from "@skip-go/client";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
    userAddress: `0x${string}`
    defi: Defi
    swap: DefiSwap
    isCosmosConnected: boolean
    skipClient?: SkipClient
}

const UniswapSwap = (props: Props) => {

    // Uniswap route
    const uniswapRoute = useUniswapRoute({
        userAddress: props.userAddress,
        inputToken: props.swap.tokenA,
        outputToken: props.swap.tokenB,
        amount: "1",
        slippage: "5.5",
        forceSwap: true
    });

    const quote = useMemo(() => {
        return uniswapRoute.data ? uniswapRoute.data.quote.toExact() : undefined;
    }, [uniswapRoute.data]);

    return (
        <Card className="gap-0 p-4 dark:bg-escher-dark_0c203d">
            <div className="flex flex-col dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg">
                <div className="flex items-center py-[10px] leading-none">
                    <div className="flex-1 flex justify-center items-center">
                        <div
                            className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_2 text-sm font-medium px-2 py-1 leading-none rounded"
                            onClick={() => console.log({ uniswapRoute: uniswapRoute.data })}
                        >SWAP</div>
                    </div>
                    <div className="h-[20px] border-l border-escher-dedfff dark:border-escher-darkblue_border" />
                    <div className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-escher-text2 dark:text-white">
                        <Image alt="" src={props.defi.logoURI} className="w-[14px] h-[14px]" />
                        <div>{props.defi.name}</div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-4 border-t border-b border-escher-dedfff dark:border-escher-darkblue_border bg-gradient-to-r from-white dark:from-escher-darkblue via-white to-[#FCF9F0]">
                    {props.swap.tokenA.icon &&
                        <TokenChain token={props.swap.tokenA} />
                    }
                    <div className="flex flex-col">
                        <div className="font-semibold text-black dark:text-white">{props.swap.tokenA.symbol}</div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 leading-none py-[10px] font-semibold text-sm dark:text-white">
                    <div>1 {props.swap.tokenA.symbol}</div>
                    <Image alt="" src={props.swap.tokenA.icon} className="w-4 h-4" />
                    <div>≈</div>
                    {quote ?
                        <div>{formatNumber(Number(quote), true, 4)} {props.swap.tokenB.symbol}</div>
                        :
                        <LdrsAnimation size={16} />
                    }
                    <Image alt="" src={props.swap.tokenB.icon} className="w-4 h-4" />
                </div>
            </div>

            <SwapUniswap
                initialTokenId={props.swap.tokenA.id}
                isApps={true}
            />

            <div className="text-xs text-escher-777e90 text-center mt-4">LP interaction executed vie <Link href={props.defi.link} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">{props.defi.name}</Link> DEX.</div>
        </Card>
    );
}

export default UniswapSwap;