import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { UNION_CONTRACTS } from "@/configs/union";
import { useTransactionTokens } from "@/hooks/transactions/useTransactions";
import { fetchCosmosQuery } from "@/lib/cosmos";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

interface Props {
    transaction: IndexerTransaction
    tokens: CustomToken[]
    unbondingTime: {
        babylon: number
        union: number
    }
}

const Tag = ({ type }: { type: 'liquid' | 'native' }) => {
    switch (type) {
        case "liquid":
            return (
                <div className="flex items-center gap-1.5 bg-escher-purple50 dark:bg-escher-darkblue_1 text-escher-purple700 text-xs font-medium rounded-full py-0.5 px-2">
                    <Icon type="FaCircle" size="xs" className="text-escher-purple500" />
                    <div>Liquid</div>
                </div>
            );
        case "native":
            return (
                <div className="flex items-center gap-1.5 bg-escher-blue50 dark:bg-escher-darkblue_1 text-escher-blue700 text-xs font-medium rounded-full py-0.5 px-2">
                    <Icon type="FaCircle" size="xs" />
                    <div>Native</div>
                </div>
            );
    }
}

const UnstakeRow = (props: Props) => {
    const { token } = useTransactionTokens({ transaction: props.transaction, tokens: props.tokens });

    const amount = useMemo(() => {
        return {
            send: BigNumber(props.transaction.amountA ?? "0").shiftedBy(-(token.send?.decimals ?? 0)).toNumber(),
            receive: props.transaction.amountB ? BigNumber(props.transaction.amountB ?? "0").shiftedBy(-(token.receive?.decimals ?? 0)).toNumber() : undefined
        };
    }, [props.transaction, token]);

    const Remaining = () => {

        if (props.transaction.lst === "babylon") {
            const submittedTime = props.transaction.submitted ?? props.transaction.time;
            const startTime = new Date(props.transaction.time).getTime();
            const now = new Date().getTime();
            const unbondingTime = token.receive?.lst?.includes("babylon") ? props.unbondingTime.babylon : props.unbondingTime.union;
            const endTime = new Date(submittedTime).getTime() + (unbondingTime * 1000) + BABYLON_CONTRACTS.unstakingOffset;

            const seconds = Math.floor((endTime - now) / 1000);
            const hours = seconds / 3600;
            const totalDays = hours / 24;

            let text = "";
            if (totalDays >= 7) {
                text = `${Math.floor(totalDays)} days`;
            } else {
                if (hours < 1) {
                    text = `<1 hour`;
                } else {
                    text = `${Math.floor(hours)} hours`;
                }
            }
            let percentage = Number((now - startTime) / (endTime - startTime) * 100);

            if (seconds < 0) {
                text = "Processing";
                percentage = 100;
            }

            return <ProgressType2
                onClick={() => console.log({ now: now, endTime: endTime, seconds, unbondingTime: props.unbondingTime, unstakeOffset: BABYLON_CONTRACTS.unstakingOffset })}
                text={text}
                percentage={percentage}
            />
        }

        if (props.transaction.lst === "union") {
            return <StatusUnion transaction={props.transaction} />
        }

        return <></>
    }

    if (!token?.send || !token.receive) {
        return <></>;
    }

    return (
        <tr className="border-t border-escher-gray100 dark:border-escher-30425B" onClick={() => console.log({ tx: props.transaction })}>
            <td className={`py-3 pl-6 flex items-center gap-3`}>
                <TokenChain token={token.send} tokenSize={23} />
                <div className="flex flex-col gap-0">
                    <div className="font-semibold text-escher-gray800 dark:text-white">{formatNumber(amount.send)}</div>
                    {/* <div className="text-xs text-escher-gray400 dark:text-escher-777e90">{amount.receive ? formatNumber(amount.receive) : "-"}</div> */}
                </div>
            </td>
            <td className="">
                <div className="flex items-start justify-start">
                    <Tag type="liquid" />
                </div>
            </td>
            <td className="pr-6">
                <Remaining />
            </td>
        </tr >
    );
}

export default UnstakeRow;

interface StatusUnionProps {
    transaction: IndexerTransaction
}

const StatusUnion = (props: StatusUnionProps) => {
    const getData = async () => {
        const responseBatches = await fetchCosmosQuery({
            lcd: "https://rest.union.build",
            contract: UNION_CONTRACTS.mainnet.lstAtUnionAddress,
            query: { "batch": { "batch_id": props.transaction.batch } } //{ "pending_batch": {} } ____ { "batch": { "batch_id": "10" } }
        });

        const batch = responseBatches.data as {
            expected_native_unstaked: string
            receive_time: string
            received_native_unstaked: string
            status: string
            submit_time: string
            total_lst_to_burn: string
            unstake_requests_count: string
        } | null;

        let status: "untracked" | "pending" | "submitted" | "received" = "untracked";
        let text = "";
        let percentage = 0;
        const now = new Date().getTime();
        let unbondedTime = 0;

        switch (batch?.status) {
            case "received":
                status = "received";
                text = "Processing";
                percentage = 100;
                break;

            case "submitted":
                {
                    status = "submitted";
                    unbondedTime = new Date(Number(batch.receive_time) * 1000).getTime();
                    break;
                }

            case "pending":
                {
                    status = "pending";
                    unbondedTime = new Date(
                        (Number(batch.submit_time) + Number(UNION_CONTRACTS.mainnet.unbondingPeriod)) * 1000
                    ).getTime();
                    break;
                }

            default:
                break;
        }

        const seconds = Math.floor((unbondedTime - now) / 1000);
        const hours = seconds / 3600;
        const totalDays = hours / 24;

        if (totalDays >= 7) {
            text = `${Math.floor(totalDays)} days`;
        } else {
            if (hours < 1) {
                text = `<1 hour`;
            } else {
                text = `${Math.floor(hours)} hours`;
            }
        }
        percentage = Number((UNION_CONTRACTS.mainnet.unbondingPeriod - seconds) / UNION_CONTRACTS.mainnet.unbondingPeriod) * 100;
        if (percentage < 0) percentage = 0;

        if (seconds < 0) {
            text = "Processing";
            percentage = 100;
        }

        return {
            status,
            text,
            percentage
        }
    }

    const queryData = useQuery({
        queryKey: ["union", "unbonding-status", props.transaction.batch],
        queryFn: getData,
        enabled: !!props.transaction.batch
    });

    if (!queryData.data || queryData.data.status === "untracked") {
        return <LdrsAnimation />
    }

    return <ProgressType2
        onClick={() => console.log({ data: queryData.data })}
        text={queryData.data?.text}
        percentage={queryData.data?.percentage}
    />
}

// reason : for past reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProgressType1 = (props: { percentage: number, text: string, onClick(): void }) => {
    return (
        <div className="flex items-center gap-1" onClick={props.onClick}>
            <div className="w-[70%] bg-escher-gray300 h-2 rounded-full">
                <div
                    className={`bg-escher-electricblue rounded-full h-full`}
                    style={{
                        'width': `${props.percentage}%`
                    }}
                ></div>
            </div>
            <div className="w-[30%] text-end text-sm font-semibold text-escher-gray800 dark:text-white whitespace-nowrap">{props.text}</div>
        </div>
    )
}

const ProgressType2Line = (props: { percentage: number, curLine: number, totalLine: number }) => {
    const isActive = (props.curLine === 0) || ((props.curLine + 1) / props.totalLine) * 100 <= props.percentage;
    return <div className={`${isActive ? "bg-escher-electricblue dark:bg-white" : "bg-gray-300 dark:bg-gray-500"} w-full h-full`} />;
}

const ProgressType2 = (props: { percentage: number, text: string, onClick(): void }) => {
    const totalLine = 24;

    return (
        <div className="flex items-center gap-4" onClick={props.onClick}>
            <div className="w-[50%] h-4 rounded-full flex justify-between gap-[3px]">
                {[...Array(totalLine)].map((_, index) => (
                    <ProgressType2Line key={index} percentage={props.percentage} curLine={index} totalLine={totalLine} />
                ))}
            </div>
            <div className="text-sm font-semibold text-escher-gray800 dark:text-white whitespace-nowrap">{props.text}</div>
        </div>
    )
}