import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityUniswap from "@/components/modal/addLiquidity/uniswap/addLiquidityUniswap";
import RemoveLiquidityUniswap from "@/components/modal/removeLiquidity/uniswap/removeLiquidityUniswap";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DefiUniswapQuery } from "@/hooks/defi/uniswap/useUniswapDefi";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Point } from "@/types/points";
import Image from "next/image";
import { useState } from "react";

interface Props {
    columnSize: string[]
    defi: DefiUniswapQuery
    isCosmosConnected: boolean
    isPointFetched: boolean
    points?: Point[]
    tokens: CustomToken[]
}

const Defi = (props: Props) => {
    const [open, setOpen] = useState(false);

    return (<>
        {props.defi.pools.map((pool, k) => {
            const point = props.points?.find(p => p.pool_address === pool.defiPool.poolAddress);

            const [openAdd, setOpenAdd] = useState(false);
            const [openRemove, setOpenRemove] = useState(false);

            return (
                <Accordion key={k} type="single" collapsible onValueChange={v => setOpen(v === 'item-1')}>
                    <AccordionItem value="item-1" className={`rounded-lg border ${open ? 'border-escher-electricblue dark:border-escher-darkblue_border' : 'border-escher-dedfff dark:border-escher-darkblue_border'}`}>
                        <AccordionTrigger
                            className={`group w-full hover:bg-escher-F1F2FB ${open ? 'rounded-t-lg bg-escher-F1F2FB dark:bg-escher-dark_0c203d' : 'rounded-lg bg-white dark:bg-escher-dark_0c203d'} flex px-6 py-2 items-center transition-all text-escher-black dark:text-white text-sm font-semibold min-h-[70px]`}
                        >
                            {/* Title */}
                            <div
                                className={`${props.columnSize[0]} flex flex-col items-start gap-1`}
                                onClick={() => console.log({ points: props.points, point, pool: pool.defiPool })}
                            >
                                <div>{pool.defiPool.title}</div>
                                {pool.defiPool.type !== "" &&
                                    <div className="text-escher-electricblue dark:text-white text-xs font-normal bg-escher-E2E3FF dark:bg-escher-darkblue dark:border dark:border-escher-darkblue_border rounded-full px-3 py-1 leading-none">{pool.defiPool.type}</div>
                                }
                            </div>

                            {/* Type */}
                            <div className={`${props.columnSize[1]}`}>Liquidity Pool</div>

                            {/* Balance */}
                            <div className={`${props.columnSize[2]} flex items-start`}>
                                <div className={`flex items-center gap-1 border border-escher-dedfff dark:border-escher-darkblue_border rounded-full bg-white dark:bg-escher-dark_0c203d p-1 pr-2`}>
                                    {!props.defi.pools ?
                                        <LdrsAnimation size={18} />
                                        :
                                        <>
                                            <Image src={pool.defiPool.tokenA.icon ?? ""} alt="" width={16} height={16} />
                                            <Image src={pool.defiPool.tokenB.icon ?? ""} alt="" width={16} height={16} className="z-10 -ml-2" />
                                            <div>
                                                {formatNumber(formatDecimal(Number(pool.position?.amount0 ?? 0), -pool.defiPool.tokenA.decimals))} : {formatNumber(formatDecimal(Number(pool.position?.amount1 ?? 0), -pool.defiPool.tokenB.decimals))}
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>

                            {/* ePoints */}
                            <div className={`${props.columnSize[3]} flex items-start`}>
                                <div className={`flex items-center gap-1`}>
                                    <Image src={"/images/epoint.svg"} alt="" width={16} height={16} />
                                    {props.isPointFetched ?
                                        <div>{formatNumber((point?.points ?? 0), false)}</div>
                                        : <LdrsAnimation size={18} />
                                    }
                                </div>
                            </div>

                            {/* Speed */}
                            <div className={`${props.columnSize[4]} flex items-start`}>
                                <div className={`flex items-center gap-1 border border-escher-dedfff dark:border-escher-darkblue_border rounded-full bg-white dark:bg-escher-dark_0c203d py-1 px-2`}>
                                    {props.isPointFetched ?
                                        <div>{point?.speed ?? 0} points / h</div>
                                        : <LdrsAnimation size={18} />
                                    }
                                </div>
                            </div>

                            {/* Partner */}
                            <div className={`${props.columnSize[5]} flex items-center justify-end gap-4`}>
                                {pool.defiPool.multiplier.map((m, k) =>
                                    <div key={k} className="flex items-center gap-1 text-escher-electricblue dark:text-white text-xs font-medium">
                                        <div>{m.text}</div>
                                        <Image alt="" src={m.logoUri} className="w-4 h-4" />
                                    </div>
                                )}
                                <Icon type="FaChevronDown" size="sm" className={`text-escher-141B34 transition-all ${open && 'rotate-180'}`} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 grid grid-cols-5 text-escher-black dark:text-white">
                            <div className="flex flex-col gap-1">
                                <div
                                    className="font-medium text-sm"
                                    onClick={() => console.log({ pool })}
                                >Sub-bucket</div>
                                <div className="text-xs text-escher-electricblue dark:text-white flex items-center gap-2">
                                    <Image src={props.defi.info.logoURI ?? ""} alt="" width={14} height={14} />
                                    <div>{props.defi.info.name}</div>
                                </div>
                            </div>

                            {/* <div className="flex flex-col gap-1">
                                <div className="font-medium text-sm">Multiplier</div>
                                <div className="text-xs text-escher-electricblue dark:text-white">{pool.defiPool.multiplier}</div>
                            </div> */}

                            <div className="flex flex-col gap-1">
                                <div className="font-medium text-sm">Token Balance</div>
                                {!props.defi.isUserDataFetched ?
                                    <LdrsAnimation size={18} />
                                    :
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Image src={pool.defiPool.tokenA.icon ?? ""} alt="" width={16} height={16} />
                                            <div>{formatNumber(formatDecimal(Number(pool.position?.amount0 ?? 0), -pool.defiPool.tokenA.decimals))}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Image src={pool.defiPool.tokenB?.icon ?? ""} alt="" width={16} height={16} />
                                            <div>{formatNumber(formatDecimal(Number(pool.position?.amount1 ?? 0), -pool.defiPool.tokenB.decimals))}</div>
                                        </div>
                                    </>
                                }
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="font-medium text-sm">ePoints Balance</div>
                                {props.isPointFetched ?
                                    <div className="text-xs text-escher-electricblue dark:text-white">{formatNumber((point?.points ?? 0), false)}</div>
                                    : <LdrsAnimation size={18} />
                                }
                            </div>

                            {props.isCosmosConnected &&
                                <div className="flex items-center gap-2">
                                    <AddLiquidityUniswap
                                        defi={props.defi.info}
                                        pool={pool.defiPool}
                                        open={openAdd}
                                        setOpen={setOpenAdd}
                                        onRemoveModalOpen={() => setOpenRemove(true)}
                                    />
                                    <RemoveLiquidityUniswap
                                        defi={props.defi.info}
                                        pool={pool.defiPool}
                                        open={openRemove}
                                        setOpen={setOpenRemove}
                                    />
                                </div>
                            }
                        </AccordionContent>
                    </AccordionItem>
                </Accordion >
            );
        }
        )}
    </>);
}

export default Defi;