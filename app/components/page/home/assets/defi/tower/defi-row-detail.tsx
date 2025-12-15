import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityTower from "@/components/modal/addLiquidity/tower/addLiquidityTower";
import ClaimLiquidityTower from "@/components/modal/claimLiquidity/tower/claimLiquidityTower";
import RemoveLiquidityTower from "@/components/modal/removeLiquidity/tower/removeLiquidityTower";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber, towerCanClaim } from "@/lib/utils";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
    defi: Defi
    pool: DefiPool
    isDefiFetched: boolean
    isCosmosConnected: boolean
}

const AssetsDefiRowDetail = (props: Props) => {
    const canClaim = useMemo(() => {
        return towerCanClaim(props.pool)
    }, [props.pool]);

    return (
        <>
            {/* Asset */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-1 font-semibold text-sm pt-1" onClick={() => console.log({ pool: props.pool })}>
                    {props.pool.tokenA?.icon &&
                        <Image src={props.pool.tokenA?.icon} width={20} height={20} alt="" className="z-10" />
                    }
                    {props.pool.tokenB?.icon &&
                        <Image src={props.pool.tokenB?.icon} width={20} height={20} alt="" className="-ml-2.5 bg-white rounded-full" />
                    }
                    <div className="font-medium text-black dark:text-white">{props.pool.tokenA?.symbol}</div>
                    <div className="dark:text-gray-500">/</div>
                    <div className="font-medium text-black dark:text-white">{props.pool.tokenB?.symbol}</div>
                </div>
            </div>

            {/* APR */}
            <div className="text-xs text-escher-text3 font-semibold leading-none mt-2">
                {props.isDefiFetched ?
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger className="text-escher-text2 dark:text-white text-xs">{formatNumber((props.pool.apr?.week?.total ?? 0) * 100)}%</TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-escher-darkblue_1 flex flex-col gap-2 text-escher-black dark:text-white border border-escher-dedfff px-4 py-3 font-medium">
                                <div className="font-semibold text-escher-electricblue dark:text-white">APR Breakdowns</div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-gray-500 dark:text-white">Swap Fees</div>
                                    <div className="dark:text-white">{formatNumber((props.pool.apr?.week?.swapFees ?? 0) * 100)}%</div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-gray-500 dark:text-white">Incentives</div>
                                    <div className="dark:text-white">{formatNumber((props.pool.apr?.week?.incentives ?? 0) * 100)}%</div>
                                </div>
                                <hr />
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-gray-500 dark:text-white">Net</div>
                                    <div className="dark:text-white">{formatNumber((props.pool.apr?.week?.total ?? 0) * 100)}%</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    :
                    <LdrsAnimation size={18} />
                }
            </div>

            {/* Liquidity */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-escher-text3 font-semibold leading-none mt-2">
                {props.isDefiFetched ?
                    <>
                        {props.pool.position ?
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger className="text-escher-text2 dark:text-white text-xs">${formatNumber(props.pool.position)}</TooltipTrigger>
                                    <TooltipContent className="bg-white dark:bg-escher-darkblue_1 flex flex-col gap-2 text-escher-black dark:text-white border border-escher-dedfff px-4 py-3 font-medium">
                                        <div className="font-semibold text-escher-electricblue dark:text-white">Total Staked</div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                                {props.pool.tokenA?.icon &&
                                                    <Image src={props.pool.tokenA?.icon} width={16} height={16} alt="" className="" />
                                                }
                                                <div>{props.pool.tokenA?.symbol}</div>
                                            </div>
                                            <div>{formatNumber(props.pool.tokenAStaked ?? 0)}</div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-1 text-gray-500 dark:text-white">
                                                {props.pool.tokenB?.icon &&
                                                    <Image src={props.pool.tokenB?.icon} width={16} height={16} alt="" className="" />
                                                }
                                                <div>{props.pool.tokenB?.symbol}</div>
                                            </div>
                                            <div>{formatNumber(props.pool.tokenBStaked ?? 0)}</div>
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
            </div>

            {/* Rewards */}
            <div className="flex flex-col items-start gap-4 text-xs text-escher-text3 dark:text-white font-semibold leading-none mt-2">
                {props.isDefiFetched ?
                    <>
                        {canClaim ? <>
                            {props.pool.rewards?.map((reward, k) =>
                                <div key={k} className="flex items-center gap-1 bg-white dark:bg-escher-darkblue_1 rounded-full py-1 px-1.5">
                                    {reward.token.icon &&
                                        <Image src={reward.token.icon} width={16} height={16} alt="" className="" />
                                    }
                                    <div>{formatNumber(reward.amount)}</div>
                                </div>
                            )}
                        </> : <>
                            -
                        </>}
                    </>
                    :
                    <LdrsAnimation size={18} />
                }
            </div>

            {props.isCosmosConnected &&
                <>
                    <div className="flex items-center gap-2">
                        <AddLiquidityTower
                            defi={props.defi}
                            pool={props.pool}
                        />
                        {props.pool.staked_share_amount &&
                            <RemoveLiquidityTower
                                defi={props.defi}
                                pool={props.pool}
                            />
                        }
                    </div>
                    <div></div>
                    <div></div>
                    <div>
                        <ClaimLiquidityTower
                            defi={props.defi}
                            pool={props.pool}
                        />
                    </div>
                </>
            }
        </ >
    );
}

export default AssetsDefiRowDetail;