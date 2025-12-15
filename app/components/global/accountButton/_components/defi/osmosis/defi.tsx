import Icon from "@/components/global/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DefiOsmosisQuery } from "@/hooks/defi/osmosis/useOsmosisDefi";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import DefiDetail from "./defi-detail";

interface Props {
    defi: DefiOsmosisQuery
}

const DefiOsmosis = (props: Props) => {
    const [open, setOpen] = useState<string>();

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v)}>
            <AccordionItem value="item-1" className={`bg-escher-f5f6f8 dark:bg-escher-darkblue rounded-lg p-0 dark:border-none ${open && 'border border-escher-electricblue'}`}>
                <AccordionTrigger
                    className="rounded-lg px-4 flex items-center justify-between hover:bg-escher-gray50 hover:dark:bg-escher-darkblue_4 transition-all text-left text-sm"
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Image src={props.defi.info.logoURI} width={20} height={20} alt="" />
                            <Image src={props.defi.info.chain.icon ?? ""} width={10} height={10} alt="" className="absolute -top-0.5 -right-0.5 border border-white rounded-full" />
                        </div>
                        <div className="font-semibold text-escher-gray800 dark:text-white">{props.defi.info.name}</div>
                    </div>

                    <div className="font-semibold text-escher-gray800 dark:text-white flex items-center justify-between gap-1">
                        <div className="flex-1 overflow-hidden">${formatNumber(props.defi.info.position ?? 0)}</div>
                        <Icon type="FaChevronDown" className={`text-escher-gray400 dark:text-escher-777e90 ${open && 'rotate-180'} transition-all`} size="sm" />
                    </div>
                </AccordionTrigger>
                <AccordionContent
                    className="relative flex flex-col bg-escher-electricblue_light5 dark:text-white dark:bg-escher-darkblue py-2 dark:pt-0 text-xs rounded-b-lg"
                >
                    <div className="flex items-center justify-between bg-white dark:bg-escher-darkblue px-3 py-2 text-[10px] text-slate-500">
                        <div className="">POOL</div>
                        <div className="">AMOUNT</div>
                    </div>
                    <div className="flex flex-col gap-0 px-3 py-2 bg-escher-fcfcfc dark:bg-escher-darkblue rounded-b-lg">
                        {props.defi.pools.map((pool, key) =>
                            <DefiDetail
                                key={key}
                                pool={pool}
                            />
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default DefiOsmosis;