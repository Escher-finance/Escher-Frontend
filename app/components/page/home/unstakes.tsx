import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import NoData from "@/components/global/noData";
import { UNION_CONTRACTS } from "@/configs/union";
import { useTransactions } from "@/hooks/transactions/useTransactions";
import useBabylonCosmosContract from "@/hooks/useBabylonCosmosContract";
import { incrementDateWithSeconds } from "@/lib/date";
import { CustomToken } from "@/types/chain";
import { useMemo } from "react";
import UnstakeRow from "./unstakes/unstake-row";

interface Props {
    tokens: CustomToken[]
}

const Unstakes = (props: Props) => {
    const { queryParameters: queryParametersBabylon } = useBabylonCosmosContract();
    const { data: transactionsData } = useTransactions();

    const unbondingPeriod = useMemo(() => ({
        babylon: queryParametersBabylon.data?.unbonding_time ?? 0,
        union: UNION_CONTRACTS.mainnet.unbondingPeriod
    }), [queryParametersBabylon.data]);

    const transactions = useMemo(() => {
        if (!queryParametersBabylon.data?.unbonding_time) {
            return [];
        }

        if (!transactionsData) {
            return undefined;
        }

        return transactionsData.filter(data => (
            data.action === "unbond" &&
            data.status === "pending"
            // !isExpired(data.time, queryParametersBabylon.data?.unbonding_time ?? 0)
        ))
            .map(t => ({
                ...t,
                remaining: incrementDateWithSeconds(t.time, t.lst === "babylon" ? unbondingPeriod.babylon : unbondingPeriod.union)
            }))
            .sort((a, b) => a.remaining.localeCompare(b.remaining))
    }, [
        transactionsData,
        queryParametersBabylon,
        unbondingPeriod
    ]);

    return (
        <Card className="flex-1 p-0">
            <div className="flex items-center justify-between px-6 py-3 min-h-[68px]">
                <div
                    className="font-medium text-escher-gray600 dark:text-white"
                    onClick={() => console.log({ unbondingPeriod, transactions })}
                >Ongoing unstake</div>
                {/* type selection, for future
                    <Select>
                        <SelectTrigger className="w-fit px-4 py-2.5 border-escher-gray300 dark:border-none">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="liquid">Liquid Staking</SelectItem>
                            <SelectItem value="native">Native Staking</SelectItem>
                        </SelectContent>
                    </Select>
                 */}

            </div>
            <div className="relative">
                {!queryParametersBabylon.isFetched &&
                    <div className="w-full py-4 border-t border-escher-dedfff flex justify-center items-center">
                        <LdrsAnimation />
                    </div>
                }

                {(queryParametersBabylon.isFetched && (transactions?.length ?? 0) === 0) &&
                    <NoData className="border-t border-escher-dedfff my-0 py-4" />
                }

                {(queryParametersBabylon.isFetched && (transactions?.length ?? 0) > 0) &&
                    <table className="table-auto w-full font-medium border-t border-escher-gray300 dark:border-none">
                        <tbody>
                            <tr className="text-xs bg-escher-gray25 dark:bg-escher-1a2d49 text-escher-gray500 dark:text-white font-medium pl-6">
                                <td className="w-[30%] py-4 pl-6">Unstaking in Progress</td>
                                <td className="w-[20%]">Type</td>
                                <td className="w-[50%]">Time Left</td>
                            </tr>
                            {transactions?.map((t, key) =>
                                <UnstakeRow
                                    key={key}
                                    transaction={t}
                                    tokens={props.tokens}
                                    unbondingTime={unbondingPeriod}
                                />
                            )}
                        </tbody>
                    </table>
                }
            </div>
        </Card>
    );
}

export default Unstakes;