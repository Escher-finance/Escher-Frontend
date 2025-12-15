import ComingSoon from "@/components/global/comingSoon";
import Icon from "@/components/global/icons";
import { Accordion, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import { useState } from "react";

interface Props {
    logo: string
    name: string
    balance: string
    value: string
    tvl: string
    ratio: string
}

const AssetsLiquidRowDummy = (props: Props) => {
    const [open] = useState<boolean>();

    return (
        <Accordion type="single" collapsible disabled>
            <AccordionItem value="item-1">
                <AccordionTrigger
                    className="relative flex px-6 py-0 border-t border-escher-gray100 dark:border-escher-30425B hover:bg-escher-gray50 dark:hover:bg-escher-112441 transition-all text-left text-sm"
                >
                    <div className="flex-1 flex items-center">
                        <div className="w-[28%] flex items-center gap-2">
                            <Image src={props.logo} width={23} height={23} alt="" />
                            <div className="font-semibold text-escher-gray800 dark:text-white">{props.name}</div>
                        </div>
                        <div className="w-[24%] py-[13.5px] flex flex-col items-start">
                            <div className="font-semibold text-escher-gray800 dark:text-white">{props.balance}</div>
                            <div className="text-xs text-escher-gray400 dark:text-escher-777e90">{props.value}</div>
                        </div>
                        <div className="w-[22%] font-semibold text-escher-gray800 dark:text-white">{props.tvl}</div>
                        <div className="w-[26%] font-medium text-escher-electricblue dark:text-white text-xs flex items-center justify-between gap-6">
                            <div className="flex-1 overflow-hidden">{props.ratio}</div>
                            <Icon type="FaChevronRight" className={`text-escher-gray400 dark:text-escher-777e90 ${open && 'rotate-90'} transition-all`} size="sm" />
                        </div>
                    </div>
                    <ComingSoon size="xs" className="rounded-none rounded-b-lg" />
                </AccordionTrigger>
            </AccordionItem>
        </Accordion >
    );
}

export default AssetsLiquidRowDummy;