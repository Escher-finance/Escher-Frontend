import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityUniswap from "@/components/modal/addLiquidity/uniswap/addLiquidityUniswap";
import ClaimLiquidityUniswap from "@/components/modal/claimLiquidity/uniswap/claimLiquidityUniswap";
import RemoveLiquidityUniswap from "@/components/modal/removeLiquidity/uniswap/removeLiquidityUniswap";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UniswapPoolResult } from "@/hooks/defi/uniswap/useUniswapDefi";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { Defi } from "@/types/defi";
import Image from "next/image";
import { useState } from "react";

interface Props {
    defi: Defi
    pool: UniswapPoolResult
    isEvmConnected: boolean
}

const AssetsDefiRowDetail = (props: Props) => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openRemove, setOpenRemove] = useState(false);

    return (
        <>
            {/* Asset */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-1 font-semibold text-sm pt-1" onClick={() => console.log({ pool: props.pool })}>
                    {props.pool.defiPool.tokenA?.icon &&
                        <Image src={props.pool.defiPool.tokenA.icon} width={20} height={20} alt="" className="z-10" />
                    }
                    {props.pool.defiPool.tokenB?.icon &&
                        <Image src={props.pool.defiPool.tokenB.icon} width={20} height={20} alt="" className="-ml-2.5 bg-white dark:bg-escher-darkblue rounded-full" />
                    }
                    <div className="font-medium text-black dark:text-white">{props.pool.defiPool.tokenA?.symbol}</div>
                    <div className="dark:text-gray-500">/</div>
                    <div className="font-medium text-black dark:text-white">{props.pool.defiPool.tokenB?.symbol}</div>
                </div>
            </div>

            {/* APR */}
            <div className="text-xs text-escher-text3 dark:text-white font-semibold leading-none mt-2">
                -
            </div>

            {/* Liquidity */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-escher-text3 font-semibold leading-none mt-2">
                {props.isEvmConnected ? (
                    <>
                        {props.pool.isFetched ?
                            <>
                                {props.pool.position ?
                                    <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger className="text-escher-text2 dark:text-white text-xs">${formatNumber(Number(props.pool.position.totalValue))}</TooltipTrigger>
                                            <TooltipContent className="bg-white dark:bg-escher-darkblue flex flex-col gap-2 text-escher-black dark:text-white border border-escher-dedfff dark:border-escher-darkblue_border px-4 py-3 font-medium">
                                                <div className="font-semibold text-escher-electricblue dark:text-white">Total Staked</div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                                        {props.pool.defiPool.tokenA?.icon &&
                                                            <Image src={props.pool.defiPool.tokenA?.icon} width={16} height={16} alt="" className="" />
                                                        }
                                                        <div>{props.pool.defiPool.tokenA?.symbol}</div>
                                                    </div>
                                                    <div>{formatNumber(formatDecimal(Number(props.pool.position.amount0), -props.pool.defiPool.tokenA?.decimals))}</div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                                        {props.pool.defiPool.tokenB?.icon &&
                                                            <Image src={props.pool.defiPool.tokenB?.icon} width={16} height={16} alt="" className="" />
                                                        }
                                                        <div>{props.pool.defiPool.tokenB?.symbol}</div>
                                                    </div>
                                                    <div>{formatNumber(formatDecimal(Number(props.pool.position.amount1), -props.pool.defiPool.tokenB?.decimals))}</div>
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
            <div className="flex flex-col gap-4 text-xs text-escher-text3 font-semibold leading-none mt-2">
                {props.pool.position ?
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger className="text-escher-text2 dark:text-white text-xs">${formatNumber(Number(props.pool.position.totalRewardsValue))}</TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-escher-darkblue flex flex-col gap-2 text-escher-black dark:text-white border border-escher-dedfff px-4 py-3 font-medium">
                                <div className="font-semibold text-escher-electricblue dark:text-white">Total rewards</div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                        {props.pool.defiPool.tokenA?.icon &&
                                            <Image src={props.pool.defiPool.tokenA?.icon} width={16} height={16} alt="" className="" />
                                        }
                                        <div>{props.pool.defiPool.tokenA?.symbol}</div>
                                    </div>
                                    <div>{formatNumber(formatDecimal(Number(props.pool.position.tokensOwed0), -props.pool.defiPool.tokenA?.decimals))}</div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                        {props.pool.defiPool.tokenB?.icon &&
                                            <Image src={props.pool.defiPool.tokenB?.icon} width={16} height={16} alt="" className="" />
                                        }
                                        <div>{props.pool.defiPool.tokenB?.symbol}</div>
                                    </div>
                                    <div>{formatNumber(formatDecimal(Number(props.pool.position.tokensOwed1), -props.pool.defiPool.tokenB?.decimals))}</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    : <>
                        -
                    </>
                }
            </div>

            {props.isEvmConnected &&
                <>
                    <div className="flex items-center gap-2">
                        <AddLiquidityUniswap
                            defi={props.defi}
                            pool={props.pool.defiPool}
                            open={openAdd}
                            setOpen={setOpenAdd}
                        />
                        {props.pool.position &&
                            <RemoveLiquidityUniswap
                                defi={props.defi}
                                pool={props.pool.defiPool}
                                open={openRemove}
                                setOpen={setOpenRemove}
                            />
                        }
                    </div>
                    <div></div>
                    <div></div>
                    <div>
                        <ClaimLiquidityUniswap
                            defi={props.defi}
                            pool={props.pool.defiPool}
                        />
                    </div>
                </>
            }
        </ >
    );
}

export default AssetsDefiRowDetail;