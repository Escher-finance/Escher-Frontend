import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import Link from "next/link";

interface Props {
    token: CustomToken
    totalTvl?: number
}

const AssetsLiquidRowChain = (props: Props) => {
    return (
        <div className="flex items-center py-3">
            <div className="w-[28%] flex items-center gap-2">
                <TokenChain token={props.token} />
                <div className="font-medium text-black dark:text-white" onClick={() => console.log({ props })}>On {props.token.chain.name}</div>
            </div>
            <div className="w-[24%] font-semibold text-escher-gray500 dark:text-white">{formatNumber(Number(props.token.balance?.formattedBalance ?? 0))}</div>
            {(props.token.tvl !== undefined) ?
                <div className="w-[20%] font-semibold text-escher-gray500 dark:text-white">${
                    props.token.lst?.includes("union") ?
                        formatNumber(props.totalTvl ?? 0) :
                        formatNumber(props.token.tvl)
                }</div>
                :
                <div className="w-[20%] font-semibold text-escher-gray500 dark:text-white"><LdrsAnimation /></div>
            }
            <div className="w-[28%] font-semibold text-escher-gray500 dark:text-white flex items-center justify-between">
                {(props.token.coingeckoPrice !== undefined) ?
                    <div>${formatNumber(props.token.coingeckoPrice)}</div>
                    :
                    <LdrsAnimation />
                }
                <Link href={"/defi-hub"} className="text-escher-electricblue dark:text-white underline underline-offset-2 text-[10px] font-medium">Put to use</Link>
            </div>
        </div>
    );
}

export default AssetsLiquidRowChain;