import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import SwapOsmosis from "@/components/modal/swap/osmosis/swapOsmosis";
import { useOsmosisSqsDirect } from "@/hooks/defi/osmosis/useOsmosisSqs";
import { formatNumber } from "@/lib/utils";
import { Defi, DefiSwap } from "@/types/defi";
import Image from "next/image";
import Link from "next/link";

interface Props {
    defi: Defi
    swap: DefiSwap
}

const OsmosisSwap = (props: Props) => {

    const route = useOsmosisSqsDirect({
        amount: "1",
        poolID: props.swap.poolID?.toString() ?? "",
        tokenIn: props.swap.tokenA,
        tokenOut: props.swap.tokenB
    });

    return (
        <Card className="gap-0 p-4 dark:bg-escher-dark_0c203d">
            <div className="flex flex-col dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg">
                <div className="flex items-center py-2.5 leading-none">
                    <div className="flex-1 flex justify-center items-center">
                        <div
                            className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_2 text-sm font-medium px-2 py-1 leading-none rounded"
                            onClick={() => console.log({ route })}
                        >SWAP</div>
                    </div>
                    <div className="h-5 border-l border-escher-dedfff dark:border-escher-darkblue_border" />
                    <div className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-escher-text2 dark:text-white">
                        <Image alt="" src={props.defi.logoURI} className="w-3.5 h-3.5" width={14} height={14} />
                        <div>{props.defi.name}</div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-4 border-t border-b border-escher-dedfff dark:border-escher-darkblue_border bg-linear-to-r from-white dark:from-escher-darkblue via-white to-[#FCF9F0]">
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
                    {route.data ?
                        <div>{formatNumber(Number(route.data.amount_out_formatted), true, 4)} {props.swap.tokenB.symbol}</div>
                        :
                        <LdrsAnimation size={16} />
                    }
                    {props.swap.tokenB.icon &&
                        <Image alt="" src={props.swap.tokenB.icon} className="w-4 h-4" width={16} height={16} />
                    }
                </div>
            </div>

            <SwapOsmosis
                isApps={true}
            />

            <div className="text-xs text-escher-777e90 text-center mt-4">LP interaction executed vie <Link href={props.defi.link} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">{props.defi.name}</Link> DEX.</div>
        </Card>
    );
}

export default OsmosisSwap;