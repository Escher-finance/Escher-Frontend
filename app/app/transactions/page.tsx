"use client";

import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import NoData from "@/components/global/noData";
import Filter from "@/components/page/transactions/filter";
import Transaction from "@/components/page/transactions/transaction";
import { useEscher } from "@/components/providers/escherProvider";
import { UNION_CONTRACTS } from "@/configs/union";
import { useTransactions } from "@/hooks/transactions/useTransactions";
import useBabylonCosmosContract from "@/hooks/useBabylonCosmosContract";
import { LiquidStaking } from "@/types/chain";
import { Action, IndexerTransaction, Status } from "@/types/transaction";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

interface Pagination {
    perPage: number
    page: number
    total: number
    totalPage: number
}

const Page = () => {
    const { account, tokens } = useEscher();
    const { queryParameters: queryParametersBabylon } = useBabylonCosmosContract();
    const { data: transactions, isFetched } = useTransactions();

    // Filters
    const [operation, setOperation] = useState<Action>();
    const [lst, setLst] = useState<LiquidStaking>();
    const [status, setStatus] = useState<Status>();
    const [pagination, setPagination] = useState<Pagination>({
        perPage: 20,
        page: 0,
        total: 0,
        totalPage: 0
    });

    const pageNext = (val: number) => {
        setPagination(prev => ({
            ...prev,
            page: prev.page + val
        }));
    }

    const [transactionsFiltered, transactionsPaginated] = useMemo(() => {
        const txs = transactions
            .filter(v =>
                (operation ? v.action === operation : true) &&
                (lst ? v.lst === lst : true) &&
                (status ? getStatus(v, status) : true)
            );

        return [
            txs,
            txs
                .slice(
                    pagination.page * pagination.perPage,
                    (pagination.page * pagination.perPage) + pagination.perPage
                )
        ]
    }, [lst, operation, pagination.page, pagination.perPage, status, transactions]);

    useEffect(() => {
        let curPage = pagination.page;
        const totalPage = Math.ceil(transactionsFiltered.length / pagination.perPage);
        if (curPage > totalPage) curPage = 0;

        setPagination(prev => ({
            ...prev,
            totalPage: totalPage,
            page: curPage
        }));
    }, [pagination.page, pagination.perPage, transactionsFiltered.length])

    const unbondingPeriod = useMemo(() => ({
        babylon: queryParametersBabylon.data?.unbonding_time ?? 0,
        union: UNION_CONTRACTS.mainnet.unbondingPeriod
    }), [queryParametersBabylon.data]);

    return (
        <div className="w-full max-w-[1440px] mx-auto p-8 flex flex-col gap-4">
            {/* <button onClick={() => refetch()}>refetch</button> */}
            <div className="bg-white dark:bg-escher-darkblue dark:text-white rounded-lg border border-escher-e4e8ed dark:border-escher-darkblue_border flex flex-col">
                <div
                    className="relative min-h-[200px] flex items-center justify-between p-6"
                    onClick={() => console.log({
                        transactions,
                        transactionsFiltered
                    })}
                >
                    <div className="absolute inset-0 bg-no-repeat bg-right bg-[url('/images/transaction.svg')] bg-contain" />
                    <div className="flex items-center gap-2">
                        <div className="text-[40px] font-bold">Transactions</div>
                        {/* {queryTransactions.data?.length &&
                            <div className="text-xs text-escher-electricblue dark:text-white bg-escher-purple50 px-2 py-1 rounded-full">{queryTransactions.data.length}</div>
                        } */}
                    </div>
                </div>

                <hr className="border-t border-escher-e4e8ed dark:border-escher-darkblue_border" />

                <Filter
                    operation={operation}
                    setOperation={setOperation}
                    lst={lst}
                    setLst={setLst}
                    status={status}
                    setStatus={setStatus}
                />
            </div>

            {(account.cosmos?.isConnected || account.evm?.isConnected) ? (
                <>
                    {isFetched ?
                        <>
                            {transactionsFiltered.length == 0 &&
                                <NoData />
                            }
                        </>
                        :
                        <>
                            <div className="flex flex-col items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-300">
                                <LdrsAnimation />
                                <div>loading transactions</div>
                            </div>
                        </>
                    }

                    <div className="flex flex-col gap-4">
                        {transactionsPaginated.map((tx, index) =>
                            <Transaction
                                key={index}
                                transaction={tx}
                                tokens={tokens}
                                unbondingTime={unbondingPeriod}
                            />
                        )}
                        {transactionsFiltered.length > 0 &&
                            <div className="flex justify-center">
                                <div className={clsx(
                                    "flex items-center rounded",
                                    "bg-escher-electricblue_light2 dark:bg-escher-dark_0c203d",
                                    "dark:border dark:border-escher-darkblue_border"
                                )}>
                                    <PaginationButton
                                        direction="left"
                                        enabled={pagination.page > 0}
                                        onClick={() => pageNext(-1)}
                                    />
                                    <div
                                        className="border-x border-escher-electricblue_light4 dark:border-escher-darkblue_border text-gray-700 dark:text-white px-2 font-medium text-sm"
                                    >
                                        page {pagination.page + 1} of {pagination.totalPage}
                                    </div>
                                    <PaginationButton
                                        direction="right"
                                        enabled={(pagination.page + 1) < pagination.totalPage}
                                        onClick={() => pageNext(1)}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </>
            ) : (
                <NoData />
            )}
            {/* <AutoReconnect /> */}
        </div>
    );
}

export default Page;

const PaginationButton = (props: { enabled: boolean, onClick(): void, direction: "left" | "right" }) => {
    return (
        <button
            onClick={props.onClick}
            disabled={!props.enabled}
            className={clsx(
                "p-2",
                props.direction === "left" ? "rounded-l" : "rounded-r",
                props.enabled && "hover:bg-escher-electricblue_light4 dark:hover:bg-escher-darkblue_border",
                props.enabled ?
                    "text-escher-electricblue dark:text-white" :
                    "text-escher-electricblue_light7 dark:text-escher-darkblue_border",
            )}
        >
            <Icon type={props.direction === "left" ? "FaChevronLeft" : "FaChevronRight"} />
        </button>
    );
}

const getStatus = (tx: IndexerTransaction, status: Status): boolean => {
    // TODO bridge is kinda tricky
    if (tx.action === "bridge") return false;
    return tx.status === status;
}