import Icon from "@/components/global/icons";
import TokenChain from "@/components/global/tokenChain";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDate } from "@/lib/date";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";
import Detail from "../details/detail";

interface Props {
    transaction: IndexerTransaction
    tokens: CustomToken[]
    unbondingTime: {
        babylon: number
        union: number
    }
}

const TransactionTower = (props: Props) => {
    const token = useMemo(() => {
        return {
            a: props.tokens.find(t => t.denom === props.transaction.denomA),
            b: props.tokens.find(t => t.denom === props.transaction.denomB),
        };
    }, [props.transaction, props.tokens]);

    let date;
    if (props.transaction.time) {
        try {
            date = formatDate(props.transaction.time);
        } catch (error) {
            console.error(error);
        }
    }

    const [open, setOpen] = useState(false);

    if (!date) return <></>

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v === 'item-1')}>
            <AccordionItem
                value="item-1"
                className={clsx(
                    "rounded-lg border",
                    open ?
                        'border-escher-electricblue dark:border-escher-darkblue_border' :
                        'bg-escher-dedfff dark:border-escher-darkblue_border dark:bg-escher-darkblue'
                )}
            >
                <AccordionTrigger
                    className={clsx(
                        "group w-full hover:bg-escher-F1F2FB grid grid-cols-11 px-6 py-2 items-center transition-all text-escher-black dark:text-white",
                        "dark:hover:bg-escher-dark_0c203d",
                        open ?
                            'rounded-t-lg bg-escher-F1F2FB dark:bg-escher-dark_0c203d' :
                            'rounded-lg bg-white dark:bg-escher-darkblue',
                    )}
                >
                    <ColumnTitle
                        transaction={props.transaction}
                    />

                    <ColumnContent
                        transaction={props.transaction}
                        open={open}
                        token={token}
                    />

                    <div className="col-span-2 flex justify-start items-center text-escher-electricblue dark:text-white">
                        <ColumnType />
                    </div>

                    <div className="col-span-2 flex justify-start items-center">
                        <ColumnStatus />
                    </div>

                    <div className="col-span-2 flex items-center justify-between text-sm font-medium">
                        <div>{date}</div>
                        <Icon type="FaChevronDown" size="sm" className={`text-escher-141B34 dark:text-white transition-all ${open && 'rotate-180'}`} />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                    <DetailContent
                        token={token}
                        transaction={props.transaction}
                        unbondingTime={props.unbondingTime}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default TransactionTower;


const ColumnTitle = (props: { transaction: IndexerTransaction }) => {
    switch (props.transaction.action) {
        case "towerAdd":
            return (
                <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] flex items-center justify-center">
                        <Image alt="" src={"/icons/liquid_staking-blue.svg"} width={24} height={24} />
                    </div>
                    <div className="text-sm font-medium text-escher-gray900 dark:text-white">LP+</div>
                </div>
            );
        case "towerRemove":
            return (
                <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] flex items-center justify-center">
                        <Image alt="" src={"/icons/liquid_staking-orange.svg"} width={24} height={24} />
                    </div>
                    <div className="text-sm font-medium text-escher-gray900 dark:text-white">LP-</div>
                </div>
            );
    }
}

const DetailContent = (props: {
    transaction: IndexerTransaction,
    token: {
        a: CustomToken | undefined;
        b: CustomToken | undefined;
    },
    unbondingTime: {
        babylon: number
        union: number
    }
}) => {
    if (!props.token?.a) {
        return (
            <></>
        );
    }

    return <Detail
        token={props.token.a}
        transaction={props.transaction}
        unbondingTime={props.unbondingTime}
    />
}


const ColumnContent = (props: {
    transaction: IndexerTransaction,
    token: {
        a: CustomToken | undefined;
        b: CustomToken | undefined;
    },
    open: boolean
}) => {

    const showTokenB = (props.token.b !== undefined) && (props.transaction.amountB !== undefined);

    return (
        <div className={clsx(
            "col-span-4",
            showTokenB ?
                "grid grid-cols-[1fr_auto_1fr]" :
                "flex justify-center"
        )}>
            {props.token.a &&
                <TokenCard
                    open={props.open}
                    token={props.token.a}
                    amount={props.transaction.amountA}
                    className="justify-end"
                />
            }
            {showTokenB && <>
                <div className="flex items-center justify-center m-2">
                    <Icon type="FiPlus" className="text-escher-electricblue dark:text-white" />
                </div>
                <TokenCard
                    open={props.open}
                    token={props.token.b!}
                    amount={props.transaction.amountB!}
                />
            </>}
        </div>
    );
}

const ColumnType = () => {
    return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full">
            <Image alt="" src="/images/apps/app-tower-circle.png" width={18} height={18} />
            <div className="text-xs font-medium">Tower DEX LP</div>
        </div>
    );
}

const ColumnStatus = () => {
    return (
        <div className="flex items-center gap-2 bg-green-100 dark:bg-[#0b3b42] px-3 py-1 rounded-full text-green-700 dark:text-[#01ff95]">
            <Icon type="FaRegCheckCircle" size="sm" />
            <div className="text-xs font-medium">Success</div>
        </div>
    );
}

const TokenCard = ({ token, amount, className, open }: { token: CustomToken, amount: string, className?: string, open: boolean }) => {
    return (
        <div className={`flex ${className}`}>
            <div className={clsx(
                "flex items-center justify-end gap-2 col-span-2 py-2 px-2.5 rounded-lg group-hover:bg-white",
                "dark:bg-escher-darkblue dark:border dark:border-escher-darkblue_border dark:group-hover:bg-escher-darkblue",
                open ? 'bg-white' : 'bg-escher-F5F6F8'
            )}>
                <TokenChain token={token} />
                <div className="flex flex-col items-start">
                    <div className="text-sm font-semibold">{token.symbol}</div>
                    <div className="text-xs text-escher-gray500 dark:text-white">{
                        formatNumber(
                            formatDecimal(Number(amount), -token.decimals), true, 4
                        )
                    }</div>
                </div>
            </div>
        </div>
    );
}