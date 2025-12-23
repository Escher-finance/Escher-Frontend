import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { useTheme } from "@/components/providers/themeProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTransactionTokens } from "@/hooks/transactions/useTransactions";
import { formatDate } from "@/lib/date";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import Detail from "../details/detail";
import DetailUnbondUnion from "../details/unbond-union";
import { PillPending, PillSuccess, StatusIndexer } from "../shared";

interface Props {
    transaction: IndexerTransaction
    tokens: CustomToken[]
    unbondingTime: {
        babylon: number
        union: number
    }
}

const TransactionRow = (props: Props) => {
    const { themeIsDark } = useTheme();
    const { token } = useTransactionTokens({ transaction: props.transaction, tokens: props.tokens });

    let date;
    if (props.transaction.time) {
        try {
            date = formatDate(props.transaction.time);
        } catch (error) {
            console.error(error);
        }
    }

    const [open, setOpen] = useState(false);

    if (!token?.send) {
        return (
            <div onClick={() => console.log(props.transaction)}>no send</div>
            // <></>
        );
    }

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
                    onClick={() => console.log({ token, trx: props.transaction })}
                >
                    <ColumnTitle
                        themeIsDark={themeIsDark}
                        transaction={props.transaction}
                    />

                    <ColumnToken
                        open={open}
                        token={token}
                        transaction={props.transaction}
                    />

                    <div className="col-span-2 flex justify-start items-center text-escher-electricblue dark:text-white">
                        <ColumnType
                            themeIsDark={themeIsDark}
                            transaction={props.transaction}
                        />
                    </div>

                    <div className="col-span-2 flex justify-start items-center">
                        <ColumnStatus
                            transaction={props.transaction}
                            unbondingTime={props.unbondingTime}
                        />
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

export default TransactionRow;

const DetailContent = (props: {
    token: {
        send: CustomToken | undefined;
        receive: CustomToken | undefined;
    }
    transaction: IndexerTransaction
    unbondingTime: {
        babylon: number
        union: number
    }
}) => {

    if (!props.token?.send) {
        return (
            <></>
        );
    }

    if (["bridge", "dust", "withdraw"].includes(props.transaction.action)) {
        return <Detail
            token={props.token.send}
            transaction={props.transaction}
            unbondingTime={props.unbondingTime}
        />
    }

    if (!props.token?.receive) {
        return (
            <></>
        );
    }

    if (props.transaction.lst === "union" && props.transaction.action === "unbond")
        return <DetailUnbondUnion
            token={props.token.send}
            transaction={props.transaction}
            unbondingTime={props.unbondingTime.union}
        />

    return <Detail
        token={props.token.send}
        tokenReceive={props.token.receive}
        transaction={props.transaction}
        unbondingTime={props.unbondingTime}
    />
}

const ColumnTitle = (props: {
    transaction: IndexerTransaction
    themeIsDark: boolean
}) => {
    switch (props.transaction.action) {
        case "bond":
            return (
                <div className="flex items-center gap-3">
                    <Image alt=""
                        src={props.themeIsDark ?
                            "/icons/transaction/stake-dark.svg" :
                            "/icons/transaction/stake.svg"
                        }
                        width={30}
                        height={30}
                    />
                    <div className="text-sm font-medium text-escher-gray900 dark:text-white">Stake</div>
                </div>
            );
        case "unbond":
            return (
                <div className="flex items-center gap-3">
                    <Image alt=""
                        src={props.themeIsDark ?
                            "/icons/transaction/unstake-dark.svg" :
                            "/icons/transaction/unstake.svg"
                        }
                        width={30}
                        height={30}
                    />
                    <div className="text-sm font-medium text-escher-gray900 dark:text-white">Unstake</div>
                </div>
            );
        case "dust":
            return (
                <div className="flex items-center gap-3">
                    <Icon type="MdGrain" className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                    <div className="text-sm font-medium text-escher-gray900 dark:text-white">Dust recovery</div>
                </div>
            );
        case "withdraw":
            return (
                <div className="flex items-center gap-3">
                    <Icon type="PiHandCoins" className="w-6 h-6 text-escher-electricblue dark:text-escher-electricblue_light1" />
                    <div className="text-sm font-medium text-escher-gray900 dark:text-white">Token withdraws</div>
                </div>
            );
        case "bridge":
            return (
                <div className="flex items-center gap-3">
                    <Image alt=""
                        src={props.themeIsDark ?
                            "/icons/transaction/bridge.svg" :
                            "/icons/transaction/bridge.svg"
                        }
                        width={30}
                        height={30}
                    />
                    <div className="text-sm font-medium text-escher-gray900 dark:text-white">Bridge</div>
                </div>
            );
    }
}

const ColumnToken = (props: {
    open: boolean
    transaction: IndexerTransaction
    token: {
        send: CustomToken | undefined;
        receive: CustomToken | undefined;
    }
}) => {
    const showTokenB = (props.token.receive !== undefined) && (props.transaction.amountB !== undefined);

    return (
        <div className={clsx(
            "col-span-4",
            showTokenB ?
                "grid grid-cols-[1fr_auto_1fr]" :
                "flex justify-center"
        )}>
            {props.token.send &&
                <TokenCard
                    token={props.token.send}
                    amount={props.transaction.amountA}
                    className="justify-end"
                    open={props.open}
                />
            }
            {showTokenB && <>
                <div className="flex items-center justify-center m-2">
                    <Icon type="BsArrowRight" className="text-escher-electricblue dark:text-white" />
                </div>
                <TokenCard
                    token={props.token.receive!}
                    amount={props.transaction.amountB!}
                    open={props.open}
                />
            </>}
        </div>
    );
}

const TokenCard = ({ token, amount, className, open }: { token: CustomToken, amount: string, className?: string, open: boolean }) => {
    return (
        <div className={`flex ${className}`}>
            <div className={clsx(
                "flex items-center justify-end gap-2 col-span-2 py-2 px-2.5 rounded-lg group-hover:bg-white",
                "dark:bg-escher-darkblue dark:border dark:border-escher-darkblue_border dark:group-hover:bg-escher-darkblue",
                open ? 'bg-white' : 'bg-escher-f5f6f8'
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

const ColumnType = (props: {
    transaction: IndexerTransaction
    themeIsDark: boolean
}) => {

    switch (props.transaction.action) {
        case "bond":
        case "unbond":
        case "towerRemove":
        case "towerAdd":
        case "dust":
        case "withdraw":
            break;
        case "bridge":
            return (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full">
                    <Image alt=""
                        src={props.themeIsDark ?
                            "/icons/transaction/bridge-blue.svg" :
                            "/icons/transaction/bridge-blue.svg"
                        }
                        className={props.themeIsDark ? "w-4 h-4" : "w-5 h-5"}
                        width={props.themeIsDark ? 16 : 20}
                        height={props.themeIsDark ? 16 : 20}
                    />
                    <div className="text-xs font-medium">Bridge</div>
                </div>
            );
    }

    return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full">
            <Image
                alt=""
                src={props.themeIsDark ? "/icons/transaction/liquid-staking_icon-dark.svg" : "/icons/transaction/liquid-staking_icon.svg"}
                className={props.themeIsDark ? "w-4 h-4" : "w-5 h-5"}
                width={props.themeIsDark ? 16 : 20}
                height={props.themeIsDark ? 16 : 20}
            />
            <div className="text-xs font-medium">Liquid Staking</div>
        </div>
    );
}

const ColumnStatus = (props: {
    transaction: IndexerTransaction
    unbondingTime: {
        babylon: number
        union: number
    }
}) => {
    if (props.transaction.source === "local" && props.transaction.action !== "bridge") {
        switch (props.transaction.status) {
            case "success":
                return (
                    <PillSuccess text="Success" />
                );

            default:
                return (
                    <PillPending text="On progress" />
                );
        }
    }

    switch (props.transaction.action) {
        case "unbond":
            if (!props.unbondingTime) {
                return (
                    <LdrsAnimation size={18} />
                );
            }
            if (props.transaction.status === "success") {
                return (
                    <PillSuccess text="Success" />
                );
            } else {
                return (
                    <PillPending text="Ongoing unstake" />
                );
            }
        case "bond":
        case "dust":
        case "withdraw":
            if (props.transaction.status === "success") {
                return (
                    <PillSuccess text="Success" />
                );
            } else {
                return (
                    <PillPending text="On progress" />
                );
            }
        case "bridge":
            return <StatusIndexer hash={props.transaction.hash} />
    }
}