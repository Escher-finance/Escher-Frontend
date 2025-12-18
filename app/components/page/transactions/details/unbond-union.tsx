import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { UNION_CONTRACTS } from "@/configs/union";
import { fetchCosmosQuery } from "@/lib/cosmos";
import { shortenAddress } from "@/lib/text";
import { getExplorerUrlByChainId } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";

interface Props {
    transaction: IndexerTransaction
    token: CustomToken
    unbondingTime: number
}

const DetailUnbondUnion = (props: Props) => {

    const explorerLink = useMemo(() => {
        return getExplorerUrlByChainId(
            props.token.chain.id,
            "tx",
            props.transaction.hash
        );
    }, [props.token.chain.id, props.transaction.hash]);

    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-escher-darkblue dark:text-white p-6 rounded-b-lg">
            <div className="border rounded-full border-escher-e4e8ed dark:border-escher-darkblue_border w-fit p-1 pr-2 flex items-center flex-row gap-1">
                {props.token.chain.icon && (
                    <Image width={20} height={20} src={props.token.chain.icon} alt={props.token.chain.name} />
                )}
                <div>
                    Recipient: <Link href={getExplorerUrlByChainId(props.token.chain.id, "address", props.transaction.userAddress) ?? ""} target="_blank" className="underline underline-offset-1">{props.transaction.userAddress}</Link>
                </div>
            </div>

            <div className="flex gap-10">
                {props.token.chain.network !== "evm" &&
                    <div className="flex flex-col gap-1 leading-none">
                        <div className="text-sm text-escher-black dark:text-white font-medium">Transaction Hash</div>
                        <div className="flex items-center gap-2 text-escher-777e90 text-xs">
                            <div>{shortenAddress(props.transaction.hash, 5, 20)}</div>

                            <CopyToClipboard
                                text={props.transaction.hash}
                                onCopy={() => {
                                    toast.info('Address copied to clipboard!');
                                }}
                            >
                                <button
                                    className=""
                                >
                                    <Icon type="FiCopy" size="sm" />
                                </button>
                            </CopyToClipboard>
                        </div>
                    </div>
                }
                {explorerLink &&
                    <div className="flex flex-col gap-1 leading-none">
                        <div className="text-sm text-escher-black dark:text-white font-medium">Blockchain Explorer</div>
                        <Link href={explorerLink} target="_blank" className="text-escher-electricblue dark:text-white text-xs hover:underline underline-offset-1">View on explorer</Link>
                    </div>
                }
                {props.transaction.action === "unbond" &&
                    <UnbondingProgress
                        transaction={props.transaction}
                        unbondingTime={props.unbondingTime}
                    />
                }
            </div>
        </div>
    );
}

export default DetailUnbondUnion;


const UnbondingProgress = (props: {
    transaction: IndexerTransaction
    unbondingTime: number
}) => {
    if (!props.unbondingTime) {
        return undefined;
    }

    if (props.transaction.status !== "success") {
        if (props.transaction.lst === "babylon") {

            const submittedTime = props.transaction.submitted ?? props.transaction.time;
            const startTime = new Date(props.transaction.time).getTime();
            const now = new Date().getTime();
            const endTime = new Date(submittedTime).getTime() + (props.unbondingTime * 1000);

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

            if (seconds < 0) {
                return (
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-escher-black dark:text-white font-medium">Remaining time</div>
                        <div className="min-w-[250px] flex items-center gap-4" onClick={() => console.log({ now: now, endTime: endTime - startTime, seconds, unbondingTime: props.unbondingTime, unstakeOffset: BABYLON_CONTRACTS.unstakingOffset })}>
                            <div className="w-[70%] bg-escher-gray300 h-2 rounded-full">
                                <div
                                    className={`bg-escher-electricblue rounded-full h-full`}
                                    style={{
                                        'width': `100%`
                                    }}
                                ></div>
                            </div>
                            <div className="text-xs font-medium text-escher-gray800 dark:text-white whitespace-nowrap">Processing</div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex flex-col gap-1">
                    <div className="text-sm text-escher-black dark:text-white font-medium">Remaining time</div>
                    <div className="min-w-[250px] flex items-center gap-4" onClick={() => console.log({ now: now, endTime: endTime - startTime, seconds, unbondingTime: props.unbondingTime, unstakeOffset: BABYLON_CONTRACTS.unstakingOffset })}>
                        <div className="w-[70%] bg-escher-gray300 h-2 rounded-full">
                            <div
                                className={`bg-escher-electricblue rounded-full h-full`}
                                style={{
                                    'width': `${Number((now - startTime) / (endTime - startTime) * 100).toFixed(0)}%`
                                }}
                            ></div>
                        </div>
                        <div className="text-xs font-medium text-escher-gray800 dark:text-white whitespace-nowrap">{text}</div>
                    </div>
                </div>
            );
        }

        if (props.transaction.lst === "union") {
            return <StatusUnion transaction={props.transaction} />
        }
    }

    return undefined;
}


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

    return (
        <div className="flex flex-col gap-1">
            <div className="text-sm text-escher-black dark:text-white font-medium">Remaining time</div>
            <div className="min-w-[250px] flex items-center gap-4" onClick={() => console.log({ data: queryData.data })}>
                <div className="w-[70%] bg-escher-gray300 h-2 rounded-full">
                    <div
                        className={`bg-escher-electricblue rounded-full h-full`}
                        style={{
                            'width': `${queryData.data.percentage.toFixed(0)}%`
                        }}
                    ></div>
                </div>
                <div className="text-xs font-medium text-escher-gray800 dark:text-white whitespace-nowrap">{queryData.data.text}</div>
            </div>
        </div>
    );
}