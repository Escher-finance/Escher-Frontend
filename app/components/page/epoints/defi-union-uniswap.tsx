import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Point } from "@/types/points";
import Image from "next/image";
import { useState } from "react";

interface Props {
    columnSize: string[]
    isEvmConnected: boolean
    isPointFetched: boolean
    points?: Point[]
    tokens: CustomToken[]
}

const DefiUnion = (props: Props) => {
    const [open, setOpen] = useState(false);

    // TODO
    // use real defi data
    const defiPool = {
        title: "eU / U",
    }
    const point = props.points?.find(p => p.pool_address === "0xc58e9e692352cccba57c66a3585a2384754dc5d6");

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v === 'item-1')}>
            <AccordionItem value="item-1" className={`rounded-lg border ${open ? 'border-escher-electricblue dark:border-escher-darkblue_border' : 'border-escher-dedfff dark:border-escher-darkblue_border'}`}>
                <AccordionTrigger
                    className={`group w-full hover:bg-escher-F1F2FB ${open ? 'rounded-t-lg bg-escher-F1F2FB dark:bg-escher-dark_0c203d' : 'rounded-lg bg-white dark:bg-escher-dark_0c203d'} flex px-6 py-2 items-center transition-all text-escher-black dark:text-white text-sm font-semibold min-h-[70px]`}
                >
                    {/* Title */}
                    <div className={`${props.columnSize[0]} flex flex-col items-start gap-1`}>
                        <div>{defiPool.title}</div>
                    </div>

                    {/* Type */}
                    <div className={`${props.columnSize[1]}`}>Liquidity Pool</div>

                    {/* Balance */}
                    {/* TODO use pool balance */}
                    <div className={`${props.columnSize[2]} flex items-start`}></div>

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
                    {/* TODO */}
                    <div className={`${props.columnSize[5]} flex items-center justify-end gap-4`}>
                        <Icon type="FaChevronDown" size="sm" className={`text-escher-141B34 transition-all ${open && 'rotate-180'}`} />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 grid grid-cols-5 text-escher-black dark:text-white">
                    <div className="flex flex-col gap-1">
                        <div
                            className="font-medium text-sm"
                        >Sub-bucket</div>
                        <div className="text-xs text-escher-electricblue dark:text-white flex items-center gap-2">
                            <Image src={"/images/apps/app-uniswap-circle-2.svg"} alt="" width={14} height={14} />
                            <div>Uniswap</div>
                        </div>
                    </div>

                    {/* TODO balance */}

                    <div className="flex flex-col gap-1">
                        <div className="font-medium text-sm">ePoints Balance</div>
                        {props.isPointFetched ?
                            <div className="text-xs text-escher-electricblue dark:text-white">{formatNumber((point?.points ?? 0), false)}</div>
                            : <LdrsAnimation size={18} />
                        }
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default DefiUnion;