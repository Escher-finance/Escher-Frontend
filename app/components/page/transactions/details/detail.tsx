import Icon from "@/components/global/icons";
import UnionTrace from "@/components/global/unionTrace/unionTrace";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { shortenAddress } from "@/lib/text";
import { formatDecimal, getExplorerUrlByChainId } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";
import { fromHex } from "viem";

interface Props {
    transaction: IndexerTransaction
    token: CustomToken
    tokenReceive?: CustomToken
    unbondingTime: {
        babylon?: number
        union?: number
    }
}

const Detail = (props: Props) => {
    const recipientAddress = useMemo(() => {
        const { channelId, recipientChannelId, userAddress, recipient } = props.transaction;

        if (recipientChannelId !== null && recipient !== null && [4].includes(recipientChannelId)) {
            try {
                return fromHex((recipient as `0x${string}`), { to: "string" })
            } catch {
                return recipient;
            }
        }

        if (recipient !== null) {
            return recipient;
        }
        // NOTE: If the tx started and ended on the same chain and there's no recipient
        // then it's the user address
        if (([0, 3].includes(channelId) && recipientChannelId === null) || (channelId === 1 && recipientChannelId === 1)) {
            return userAddress;
        }
        return undefined;
    }, [props.transaction]);

    const explorerLink = useMemo(() => {
        if (["dust", "bridge", "withdraw"].includes(props.transaction.action)) return undefined;

        let chainId = props.token.chain.id;

        if (["bond", 'unbond'].includes(props.transaction.action)) {
            switch (props.transaction.lst) {
                case "babylon": chainId = CHAINS.babylon.id; break;
            }
        }

        return getExplorerUrlByChainId(
            chainId,
            "tx",
            props.transaction.hash
        );
    }, [props.transaction.hash]);

    const showTracing = useMemo(() => {
        const { action, status, lst, source } = props.transaction;

        if (action === "bond" && source === "local") return true;

        switch (action) {
            case "bond":
            case "unbond":
                if (status === "success") return false;
                if (lst === "union") return true;
                if (!props.tokenReceive) return false;
                // if (tokenNet === "evm" || receiveNet === "evm") return true;
                return false;

            case "bridge":
            case "dust":
            case "withdraw":
                return true;

            // towerRemove, towerAdd, bridge, and any others -> always false
            default:
                return false;
        }
    }, [props.token, props.tokenReceive, props.transaction]);

    const UnbondingProgress = () => {
        if (!props.unbondingTime) {
            return undefined;
        }

        if (props.transaction.status !== "success") {

            const submittedTime = props.transaction.submitted ?? props.transaction.time;
            const startTime = new Date(props.transaction.time).getTime();
            const now = new Date().getTime();
            const unbondingTime = props.tokenReceive?.lst?.includes("babylon") ? props.unbondingTime.babylon : props.unbondingTime.union;
            if (!unbondingTime)
                return undefined;
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

        return undefined;
    }

    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-escher-darkblue dark:text-white p-6 rounded-b-lg">
            {recipientAddress && ["bond", "unbond"].includes(props.transaction.action) && props.tokenReceive && (
                <div className="border rounded-full border-escher-E4E8ED dark:border-escher-darkblue_border w-fit p-1 pr-2 flex items-center flex-row gap-1">
                    {props.tokenReceive.chain.icon && (
                        <Image width={20} height={20} src={props.tokenReceive.chain.icon} alt={props.tokenReceive.chain.name} />
                    )}
                    <div>
                        Recipient: <Link href={getExplorerUrlByChainId(props.tokenReceive.chain.id, "address", recipientAddress) ?? ""} target="_blank" className="underline underline-offset-1">{recipientAddress}</Link>
                    </div>
                </div>
            )}
            <div className="flex gap-10">
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
                {explorerLink &&
                    <div className="flex flex-col gap-1 leading-none">
                        <div className="text-sm text-escher-black dark:text-white font-medium">Blockchain Explorer</div>
                        <Link href={explorerLink} target="_blank" className="text-escher-electricblue dark:text-white text-xs hover:underline underline-offset-1">View on explorer</Link>
                    </div>
                }
                {props.transaction.action === "unbond" &&
                    <UnbondingProgress />
                }
            </div>

            {showTracing &&
                <UnionTrace
                    amount={formatDecimal(Number(props.transaction.amountA), -props.token.decimals).toString()}
                    className="w-fit min-w-[80%]"
                    estimateReceive={formatDecimal(Number(props.transaction.amountB), -(props.tokenReceive?.decimals ?? 0)).toString()}
                    isTransactionPage={true}
                    lst={props.transaction.lst}
                    operation={props.transaction.action}
                    source={props.transaction.source}
                    successTxHash={props.transaction.hash}
                    token={props.token}
                    tokenReceive={props.tokenReceive ?? props.token}
                />
            }
        </div>
    );
}

export default Detail;
