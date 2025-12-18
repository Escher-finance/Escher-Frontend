import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import AddLiquidityTower from "@/components/modal/addLiquidity/tower/addLiquidityTower";
import RemoveLiquidityTower from "@/components/modal/removeLiquidity/tower/removeLiquidityTower";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DefiTowerQuery } from "@/hooks/defi/tower/useTowerDefi";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Point } from "@/types/points";
import Image from "next/image";
import { useState } from "react";

interface Props {
    columnSize: string[]
    defi: DefiTowerQuery
    isCosmosConnected: boolean
    isPointFetched: boolean
    points?: Point[]
    tokens: CustomToken[]
}

const DefiTower = (props: Props) => {
    const [open, setOpen] = useState(false);

    return (<>
        {props.defi.pools.map((pool, k) => {
            const point = props.points?.find(p => p.pool_address === pool.data.poolAddress);

            return (
                <Accordion key={k} type="single" collapsible onValueChange={v => setOpen(v === 'item-1')}>
                    <AccordionItem value="item-1" className={`rounded-lg border ${open ? 'border-escher-electricblue dark:border-escher-darkblue_border' : 'border-escher-dedfff dark:border-escher-darkblue_border'}`}>
                        <AccordionTrigger
                            className={`group w-full hover:bg-escher-F1F2FB ${open ? 'rounded-t-lg bg-escher-F1F2FB dark:bg-escher-dark_0c203d' : 'rounded-lg bg-white dark:bg-escher-dark_0c203d'} flex px-6 py-2 items-center transition-all text-escher-black dark:text-white text-sm font-semibold min-h-[70px]`}
                        >
                            {/* Title */}
                            <div className={`${props.columnSize[0]} flex flex-col items-start gap-1`}>
                                <div>{pool.data.title}</div>
                                <div className="text-escher-electricblue dark:text-white text-xs font-normal bg-escher-E2E3FF dark:bg-escher-darkblue dark:border dark:border-escher-darkblue_border rounded-full px-3 py-1 leading-none">{pool.data.type}</div>
                            </div>

                            {/* Type */}
                            <div className={`${props.columnSize[1]}`}>Liquidity Pool</div>

                            {/* Balance */}
                            <div className={`${props.columnSize[2]} flex items-start`}>
                                <div className={`flex items-center gap-1 border border-escher-dedfff dark:border-escher-darkblue_border rounded-full bg-white dark:bg-escher-dark_0c203d p-1 pr-2`}>
                                    {!props.defi.isUserDataFetched ?
                                        <LdrsAnimation size={18} />
                                        :
                                        <>
                                            <Image src={pool.data.tokenA.icon ?? ""} alt="" width={16} height={16} />
                                            <Image src={pool.data.tokenB.icon ?? ""} alt="" width={16} height={16} className="z-10 -ml-2" />
                                            <div>{formatNumber(pool.data.tokenAStaked ?? 0)} : {formatNumber(pool.data.tokenBStaked ?? 0)}</div>
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
                                {pool.data.multiplier.map((m, k) =>
                                    <div key={k} className="flex items-center gap-1 text-escher-electricblue dark:text-white text-xs font-medium">
                                        <div>{m.text}</div>
                                        <Image alt="" src={m.logoUri} className="w-4 h-4" width={16} height={16} />
                                    </div>
                                )}
                                <Icon type="FaChevronDown" size="sm" className={`text-escher-141B34 transition-all ${open && 'rotate-180'}`} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 grid grid-cols-5 text-escher-black dark:text-white">
                            <div className="flex flex-col gap-1">
                                <div className="font-medium text-sm">Sub-bucket</div>
                                <div className="text-xs text-escher-electricblue dark:text-white flex items-center gap-2">
                                    <Image src={props.defi.info.logoURI ?? ""} alt="" width={14} height={14} />
                                    <div>{props.defi.info.name}</div>
                                </div>
                            </div>

                            {/* <div className="flex flex-col gap-1">
                                <div className="font-medium text-sm">Multiplier</div>
                                <div className="text-xs text-escher-electricblue dark:text-white">{pool.multiplier}</div>
                            </div> */}

                            <div className="flex flex-col gap-1">
                                <div className="font-medium text-sm">Token Balance</div>
                                {!props.defi.isUserDataFetched ?
                                    <LdrsAnimation size={18} />
                                    :
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Image src={pool.data.tokenA.icon ?? ""} alt="" width={16} height={16} />
                                            <div>{formatNumber((pool.data.tokenAStaked ?? 0), false)}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Image src={pool.data.tokenB?.icon ?? ""} alt="" width={16} height={16} />
                                            <div>{formatNumber((pool.data.tokenBStaked ?? 0), false)}</div>
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
                                    <AddLiquidityTower
                                        defi={props.defi.info}
                                        pool={pool.data}
                                    />
                                    <RemoveLiquidityTower
                                        defi={props.defi.info}
                                        pool={pool.data}
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

export default DefiTower;