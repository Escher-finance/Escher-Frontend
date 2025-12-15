import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityOsmosis from "@/components/modal/addLiquidity/osmosis/addLiquidityOsmosis";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OsmosisPoolResult } from "@/hooks/defi/osmosis/useOsmosisDefi";
import { formatNumber, osmosisCanClaim } from "@/lib/utils";
import { Defi } from "@/types/defi";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
    defi: Defi
    pool: OsmosisPoolResult
    isCosmosConnected: boolean
}

const AssetsDefiRowDetail = (props: Props) => {
    const canClaim = useMemo(() => {
        return osmosisCanClaim(props.pool.pool)
    }, [props.pool]);

    return (
        <>
            {/* Asset */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-1 font-semibold text-sm pt-1" onClick={() => console.log({ pool: props.pool.pool })}>
                    {props.pool.pool.tokenA?.icon &&
                        <Image src={props.pool.pool.tokenA?.icon} width={20} height={20} alt="" className="z-10" />
                    }
                    {props.pool.pool.tokenB?.icon &&
                        <Image src={props.pool.pool.tokenB?.icon} width={20} height={20} alt="" className="-ml-2.5 bg-white dark:bg-escher-darkblue rounded-full" />
                    }
                    <div className="font-medium text-black dark:text-white">{props.pool.pool.tokenA?.symbol}</div>
                    <div className="dark:text-gray-500">/</div>
                    <div className="font-medium text-black dark:text-white">{props.pool.pool.tokenB?.symbol}</div>
                </div>
            </div>

            {/* APR */}
            <div className="text-xs text-escher-text3 dark:text-white font-semibold leading-none mt-2 pt-1">
                -
            </div>

            {/* Liquidity */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-escher-text3 font-semibold leading-none mt-2 pt-1">
                {props.isCosmosConnected ? (
                    <>
                        {props.pool.isFetched ?
                            <>
                                {props.pool.pool.position ?
                                    <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger className="text-escher-text2 dark:text-white text-xs">${formatNumber(Number(props.pool.pool.position))}</TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-escher-darkblue flex flex-col gap-2 text-escher-black dark:text-white border border-escher-dedfff px-4 py-3 font-medium">
                                                <div className="font-semibold text-escher-electricblue dark:text-white">Total Staked</div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                                        {props.pool.pool.tokenA?.icon &&
                                                            <Image src={props.pool.pool.tokenA?.icon} width={16} height={16} alt="" className="" />
                                                        }
                                                        <div>{props.pool.pool.tokenA?.symbol}</div>
                                                    </div>
                                                    <div>{formatNumber(Number(props.pool.pool.tokenAStaked))}</div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                                        {props.pool.pool.tokenB?.icon &&
                                                            <Image src={props.pool.pool.tokenB?.icon} width={16} height={16} alt="" className="" />
                                                        }
                                                        <div>{props.pool.pool.tokenB?.symbol}</div>
                                                    </div>
                                                    <div>{formatNumber(Number(props.pool.pool.tokenBStaked))}</div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    : <>
                                        -
                                    </>
                                }
                            </>
                            :
                            <LdrsAnimation size={18} />
                        }
                    </>
                ) :
                    <>-</>
                }
            </div>

            {/* Rewards */}
            <div className="flex flex-col gap-4 text-xs text-escher-text3 dark:text-white font-semibold leading-none mt-2">
                {props.pool.isFetched ?
                    <>
                        {canClaim ?
                            <div className="flex flex-col gap-2 bg-white dark:bg-escher-darkblue_3 rounded-lg p-2">
                                {props.pool.pool.rewards?.map((reward, k) =>
                                    <div key={k} className="flex items-center gap-1">
                                        {reward.token.icon &&
                                            <Image src={reward.token.icon} width={16} height={16} alt="" className="" />
                                        }
                                        <div>{formatNumber(reward.amount)}</div>
                                    </div>
                                )}
                            </div> :
                            <>-</>
                        }
                    </>
                    :
                    <LdrsAnimation size={18} />
                }
            </div>

            {props.isCosmosConnected &&
                <>
                    <div className="flex items-center gap-2">
                        <AddLiquidityOsmosis
                            type="add"
                            defi={props.defi}
                            pool={props.pool.pool}
                        />
                        {props.pool.pool.position &&
                            <AddLiquidityOsmosis
                                type="remove"
                                defi={props.defi}
                                pool={props.pool.pool}
                            />
                        }
                    </div>
                    <div></div>
                    <div></div>
                    <div>
                        {canClaim &&
                            <AddLiquidityOsmosis
                                type="claim"
                                defi={props.defi}
                                pool={props.pool.pool}
                            />
                        }
                    </div>
                </>
            }
        </ >
    );
}

export default AssetsDefiRowDetail;