"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUnionTransfer } from "@/hooks/unionIndexer/transfer";
import { getTotalPhase } from "@/lib/union";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Icon from "../icons";
import LdrsAnimation from "../ldrsAnimation";
import TokenChain from "../tokenChain";
import { TraceComp, TraceLine } from "./components";

interface Props {
    amount: string
    className?: string
    estimateReceive?: string
    isTransactionPage?: boolean
    onFinalHash?(hash: string): void
    operation: Action
    source: "indexer" | "union" | "local"
    successTxHash: string
    token: CustomToken
    tokenReceive: CustomToken
}

const UnionTransfer = (props: Props) => {
    const { address: evmAddress } = useAccount();

    const totalLine = 26;
    const [showDetails, setShowDetails] = useState(true);

    const { data: transferData } = useUnionTransfer(props.successTxHash);

    let totalPhase = getTotalPhase(props.operation);
    if (props.source === "indexer") {
        totalPhase -= 2;
    }

    const showPACKET_SEND_LC_UPDATE_L2 = useMemo(() => {
        return false;
        /* 
        if (
            [CHAINS.osmosis.id].includes(props.token.chain.id) ||
            [CHAINS.osmosis.id].includes(props.tokenReceive.chain.id)
        ) {
        }

        return true; */
    }, []);

    const curTrace = useMemo(() => {
        const hashes = [
            transferData?.traces?.find(v => v.type === "PACKET_SEND")?.transaction_hash ?? undefined,
            transferData?.traces?.find(v => v.type === "PACKET_SEND_LC_UPDATE_L2")?.transaction_hash ?? undefined,
            transferData?.traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash ?? undefined,
        ];

        return {
            percentage: ((hashes.filter(v => v !== undefined).length + (props.source === "local" ? 2 : 0)) / totalPhase * 100)
        };
    }, [props.source, totalPhase, transferData?.traces]);

    const getFinishHash = useCallback(() => {
        return transferData?.traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash;
    }, [transferData?.traces]);

    const isFinished = useMemo(() => {
        const hash = getFinishHash();
        if (hash) {
            return true;
        }
        return false;
    }, [getFinishHash]);

    useEffect(() => {
        const checkFinalHash = () => {
            const hash = getFinishHash();
            if (hash && props.onFinalHash) {
                props.onFinalHash(hash);
            }
        }
        checkFinalHash();
    }, [getFinishHash, props]);

    const log = () => {
        console.log({
            evmAddress,
            instructionData: transferData
        });
    }

    return (
        <div className={`w-full flex flex-col ${props.className}`}>
            {!props.isTransactionPage &&
                <div className={`w-full ${!props.isTransactionPage && "mt-9"} flex rounded-[20px] border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f6f8 dark:bg-escher-darkblue p-2`}>
                    <div className="w-[30%] bg-white dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1" onClick={log}>
                        <div className="text-xl font-semibold flex-1 overflow-hidden">{Number(props.amount)}</div>
                        <TokenChain token={props.token} tokenSize={28} chainSize={14} />
                    </div>
                    <div className="w-[40%] flex justify-between px-4 relative">
                        {[...Array(totalLine)].map((_, index) => (
                            <TraceLine key={index} percentage={curTrace.percentage} curLine={index} totalLine={totalLine} isFinished={isFinished} />
                        ))}
                    </div>
                    <div className="w-[30%] bg-white dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1">
                        {props.estimateReceive ?
                            <div className="text-xl font-semibold flex-1 overflow-hidden">{formatNumber(Number(props.estimateReceive))}</div> :
                            <div className="text-xl font-semibold flex-1">-</div>
                        }
                        <TokenChain token={props.tokenReceive} tokenSize={28} />
                    </div>
                </div>
            }

            {transferData?.traces ?
                <Accordion
                    type="single"
                    collapsible
                    className={`${!props.isTransactionPage && "mt-6"}`}
                    value={showDetails ? "item-1" : ""}
                    onValueChange={(value) => setShowDetails(value === "item-1")}
                >
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionContent className="p-0 w-1/2">
                            <div className={clsx(
                                "grid grid-flow-col p-0 items-stretch",
                                showPACKET_SEND_LC_UPDATE_L2 ? "grid-rows-3" : "grid-rows-2",
                                "grid-cols-1 w-full mx-auto"
                            )}>
                                <TraceComp
                                    border="left"
                                    type="PACKET_SEND"
                                    traces={transferData?.traces}
                                    title={"Send packet"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                {showPACKET_SEND_LC_UPDATE_L2 &&
                                    <TraceComp
                                        border="left"
                                        type="PACKET_SEND_LC_UPDATE_L2"
                                        prevType="PACKET_SEND"
                                        traces={transferData?.traces}
                                        title={"Light Client L2 updated"}
                                        isTransactionPage={props.isTransactionPage}
                                    />
                                }
                                <TraceComp
                                    border="left"
                                    type="PACKET_RECV"
                                    prevType="PACKET_SEND_LC_UPDATE_L2"
                                    traces={transferData?.traces}
                                    title={"Packet received"}
                                    showLine={false}
                                    isTransactionPage={props.isTransactionPage}
                                />
                            </div>

                            {transferData?.packet_hash &&
                                <Link
                                    href={`https://btc.union.build/explorer/transfers/${transferData?.packet_hash}`}
                                    target="_blank"
                                    className="text-escher-electricblue dark:text-white font-semibold text-xs flex items-center gap-2 -mt-4 mb-4"
                                >
                                    <div>View transfer on Union</div>
                                    <Icon type="FiExternalLink" className="w-3 h-3" />
                                </Link>
                            }
                        </AccordionContent>
                        {!props.isTransactionPage &&
                            <AccordionTrigger
                                className={`flex justify-between items-center text-sm p-0`}
                            >
                                <div className="text-escher-gray500 dark:text-white font-medium">{showDetails ? 'Hide details' : 'Show more details'}</div>
                                {showDetails ?
                                    <Icon type="FaChevronDown" className="text-escher-electricblue dark:text-white" />
                                    :
                                    <Icon type="FaChevronDown" className="text-escher-electricblue dark:text-white rotate-180" />
                                }
                            </AccordionTrigger>
                        }
                    </AccordionItem>
                </Accordion>
                :
                <div className="text-center mt-4">
                    <LdrsAnimation />
                </div>
            }
        </div>
    );
}

export default UnionTransfer;