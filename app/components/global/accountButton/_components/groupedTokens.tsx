import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import Image from "next/image";
import { useMemo, useState } from "react";
import Icon from "../../icons";
import TokenChain from "../../tokenChain";

interface Props {
    tokens: CustomToken[]
}

const GroupedTokens = (props: Props) => {
    const [open, setOpen] = useState<string>();

    const totalValues = useMemo(() => ({
        balance: props.tokens.reduce((sum, token) => sum += Number(token.balance?.value ?? 0), 0),
        value: props.tokens.reduce((sum, token) => sum += Number(token.balance?.dollarValue ?? 0), 0),
    }), [props.tokens]);

    const token = props.tokens[0];

    if (!token) return <></>;

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v)}>
            <AccordionItem value="item-1" className={`bg-escher-f5f6f8 dark:bg-escher-darkblue p-0 border-none ${open && 'border border-escher-electricblue'}`}>
                <AccordionTrigger
                    className="px-4 py-2 flex items-center gap-2 justify-between hover:bg-escher-gray50 hover:dark:bg-escher-darkblue_4 transition-all text-left text-sm dark:text-white"
                >
                    <div className="flex-1 flex items-center gap-2">
                        <div className="relative">
                            <Image src={token.icon ?? ""} width={24} height={24} alt="" />
                        </div>
                        <div className="font-semibold text-escher-gray800 dark:text-white">{props.tokens[0]?.symbol}</div>
                    </div>

                    <div className="flex flex-col gap-1 items-end justify-between">
                        <div className="text-sm font-semibold leading-none">{formatNumber(formatDecimal(totalValues.balance, -token.decimals))}</div>
                        {(totalValues.value > 0) &&
                            <div className="text-xs leading-none text-escher-777e90">${formatNumber(totalValues.value)}</div>
                        }
                    </div>
                    <Icon type="FaChevronDown" className={`text-escher-gray400 dark:text-escher-777e90 ${open && 'rotate-180'} transition-all`} size="sm" />
                </AccordionTrigger>
                <AccordionContent
                    className="relative flex flex-col bg-escher-electricblue_light5 dark:text-white dark:bg-escher-darkblue py-2 dark:pt-0 text-xs rounded-b-lg"
                >
                    {props.tokens.map((t, k) =>
                        <div key={k} className="flex justify-between items-center px-4 py-2">
                            <div className="flex gap-2 items-center">
                                <TokenChain token={t} />
                                <div className="flex flex-col gap-1">
                                    <div className="text-sm font-semibold leading-none">{t.symbol}</div>
                                    <div className="text-xs leading-none text-escher-777e90">{t.chain.name}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end justify-between">
                                <div className="text-sm font-semibold leading-none">{formatNumber(Number(t.balance?.formattedBalance), false, 4)}</div>
                                {(t.balance?.dollarValue !== undefined && t.balance.dollarValue > 0) &&
                                    <div className="text-xs leading-none text-escher-777e90">${formatNumber(t.balance.dollarValue)}</div>
                                }
                            </div>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default GroupedTokens;