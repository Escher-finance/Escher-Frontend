import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { GroupedTokens } from "../assets";
import AssetsLiquidRowChain from "./liquid-row-chain";

interface Props {
    groupedToken: GroupedTokens
}

const AssetsLiquidRow = (props: Props) => {
    const [open, setOpen] = useState<string>();

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v)}>
            <AccordionItem value="item-1">
                <AccordionTrigger
                    className="flex px-6 py-0 border-t border-escher-gray100 dark:border-escher-30425B hover:bg-escher-gray50 dark:hover:bg-escher-112441 transition-all text-left text-sm"
                >
                    <div className="flex-1 flex items-center">
                        <div className="w-[20%] flex items-center gap-2">
                            <Image src={props.groupedToken.icon ?? ''} width={23} height={23} alt="" />
                            <div className="font-semibold text-escher-gray800 dark:text-white">{props.groupedToken.symbol}</div>
                        </div>
                        <div className="w-[20%] py-[13.5px] flex flex-col items-start">
                            <div className="font-semibold text-escher-gray800 dark:text-white">{formatNumber(props.groupedToken.balance)}</div>
                            {(props.groupedToken.balanceDollar !== undefined && props.groupedToken.balanceDollar > 0) &&
                                <div className="text-xs text-escher-gray400 dark:text-escher-777e90">${formatNumber(props.groupedToken.balanceDollar)}</div>
                            }
                        </div>
                        {(props.groupedToken.tvl !== undefined) ?
                            <div className="w-[20%] font-semibold text-escher-gray800 dark:text-white">${formatNumber(props.groupedToken.tvl)}</div>
                            :
                            <div className="w-[20%] font-semibold text-escher-gray800 dark:text-white"> <LdrsAnimation size={18} /> </div>
                        }
                        <div className="w-[20%] font-medium text-escher-electricblue dark:text-white text-xs flex items-center justify-between gap-6">
                            <Rate rate={props.groupedToken.rate} />
                        </div>
                        <div className="w-[20%] font-medium text-escher-electricblue dark:text-white text-xs flex items-center justify-between gap-6">
                            <div className="bg-escher-dedfff rounded-full p-0.5 flex gap-1">
                                <Image src={"/images/points/escher.svg"} alt="" width={14} height={14} />
                            </div>
                            {/* <Image src={"/images/points/union.svg"} alt="" width={14} height={14} /> */}
                            <Icon type="FaChevronRight" className={`text-escher-gray400 dark:text-escher-777e90 ${open && 'rotate-90'} transition-all`} size="sm" />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent
                    className="flex flex-col bg-escher-electricblue_light5 dark:bg-escher-112441 px-6 text-xs"
                >
                    <div className="flex items-center py-4 text-escher-electricblue dark:text-white font-medium">
                        <div className="w-[28%]">Network</div>
                        <div className="w-[24%]">Balance</div>
                        <div className="w-[20%]">TVL</div>
                        <div className="w-[28%]">Unitary Price</div>
                    </div>
                    {props.groupedToken.tokens?.map((t, key) =>
                        <AssetsLiquidRowChain
                            key={key}
                            token={t}
                            totalTvl={props.groupedToken.tvl}
                        />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default AssetsLiquidRow;

const Rate = (props: { rate?: string | number }) => {
    if (!props.rate) {
        return <LdrsAnimation size={18} />;
    }

    return (<div className="flex-1 overflow-hidden">1:{parseFloat(Number(props.rate).toFixed(4)).toString()}</div>);
}