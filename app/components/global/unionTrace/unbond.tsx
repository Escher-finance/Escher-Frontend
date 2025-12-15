"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUnionTraceUnbond } from "@/hooks/unionIndexer/unbond";
import { getTotalPhase } from "@/lib/union";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../icons";
import LdrsAnimation from "../ldrsAnimation";
import TokenChain from "../tokenChain";
import { TokenAnimation, TraceComp } from "./components";
import { TraceProps } from "./unionTrace";

const UnionTraceUnbond = (props: TraceProps) => {
    const totalLine = 26;
    const [showDetails, setShowDetails] = useState(true);

    const { data: unionTraceData } = useUnionTraceUnbond(props.successTxHash);

    let totalPhase = getTotalPhase(props.operation);
    if (props.source === "indexer") {
        totalPhase -= 2;
    }
    const curTrace = useMemo(() => {
        const hashes = [
            unionTraceData?.traces?.find(v => v.type === "PACKET_SEND")?.transaction_hash ?? undefined,
            unionTraceData?.traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash ?? undefined,
            unionTraceData?.traces?.find(v => v.type === "PACKET_ACK")?.transaction_hash ?? undefined,
        ];

        return {
            percentage: ((hashes.filter(v => v !== undefined).length + (props.source === "local" ? 2 : 0)) / totalPhase * 100)
        };
    }, [props.source, totalPhase, unionTraceData?.traces]);

    const getFinishHash = useCallback(() => {
        let hash: string | undefined;
        if (unionTraceData?.success) {
            hash = unionTraceData?.traces?.find(v => v.type === "PACKET_ACK")?.transaction_hash ??
                unionTraceData?.traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash ??
                unionTraceData?.traces?.find(v => v.type === "PACKET_SEND")?.transaction_hash;
        }

        return hash;
    }, [unionTraceData?.success, unionTraceData?.traces]);

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
    }, [getFinishHash, props, unionTraceData]);

    return (
        <div className={`w-full flex flex-col ${props.className}`}>
            {!props.isTransactionPage &&
                <TokenAnimation
                    amount={props.amount}
                    isFinished={isFinished}
                    isTransactionPage={props.isTransactionPage}
                    percentage={curTrace.percentage}
                    token={props.token}
                    tokenReceive={props.tokenReceive}
                    totalLine={totalLine}
                    estimateReceive={props.estimateReceive}
                />
            }

            {unionTraceData?.traces ?
                <Accordion
                    type="single"
                    collapsible
                    className={`${!props.isTransactionPage && "mt-6"}`}
                    value={showDetails ? "item-1" : ""}
                    onValueChange={(value) => setShowDetails(value === "item-1")}
                >
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionContent className="p-0">
                            <div className={clsx(
                                "grid grid-cols-1 grid-rows-3 w-full mx-auto grid-flow-col p-0 items-stretch"
                            )}>
                                {props.isTransactionPage &&
                                    <div className="flex items-start">
                                        <div className="min-w-[50%] bg-escher-F7F8FF border border-escher-dedfff rounded-xl p-3 flex items-center gap-4 mb-6">
                                            <div className="text-xl font-semibold flex-1">{Number(props.amount)}</div>
                                            <TokenChain token={props.token} tokenSize={28} chainSize={14} />
                                        </div>
                                    </div>
                                }

                                <TraceComp
                                    border="left"
                                    type="PACKET_SEND"
                                    traces={unionTraceData?.traces}
                                    title={"Send packet"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="left"
                                    type="PACKET_RECV"
                                    prevType="PACKET_SEND"
                                    traces={unionTraceData?.traces}
                                    title={"Packet received"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="left"
                                    type="PACKET_ACK"
                                    prevType="PACKET_RECV"
                                    traces={unionTraceData?.traces}
                                    title={"Packet acknowledged"}
                                    showLine={false}
                                    isTransactionPage={props.isTransactionPage}
                                />

                                {props.isTransactionPage &&
                                    <div className="flex items-start pl-36 border-l-2 border-escher-e4e8ed dark:border-escher-darkblue_border">
                                        <div className="min-w-[50%] bg-escher-F7F8FF border border-escher-dedfff rounded-xl p-3 flex items-center gap-4 mb-6">
                                            <div className="text-xl font-semibold flex-1">{Number(props.estimateReceive)}</div>
                                            <TokenChain token={props.tokenReceive} tokenSize={28} chainSize={14} />
                                        </div>
                                    </div>
                                }
                            </div>

                            {unionTraceData?.packet_hash &&
                                <Link
                                    href={`https://app.union.build/explorer/packets/${unionTraceData?.packet_hash}`}
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

export default UnionTraceUnbond;