"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUnionPacket } from "@/hooks/unionIndexer/packet";
import { getTotalPhase } from "@/lib/union";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../icons";
import LdrsAnimation from "../ldrsAnimation";
import TokenChain from "../tokenChain";
import { ChainTrace, TokenAnimation, TraceComp } from "./components";
import { TraceProps } from "./unionTrace";

const UnionTraceTransferMulti = (props: TraceProps) => {
    const lst = props.lst ?? "babylon";

    const totalLine = 26;
    const [showDetails, setShowDetails] = useState(true);

    const { data: unionTraceSend } = useUnionPacket(props.successTxHash);
    const { data: unionTraceRecv } = useUnionPacket(unionTraceSend?.packet_recv_transaction_hash);

    let totalPhase = getTotalPhase(props.operation);
    if (props.source === "indexer") {
        totalPhase -= 2;
    }
    const curTrace = useMemo(() => {
        const hashes = [
            unionTraceSend?.traces?.find(v => v.type === "PACKET_SEND")?.transaction_hash ?? undefined,
            unionTraceSend?.traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash ?? undefined,
            unionTraceSend?.traces?.find(v => v.type === "PACKET_ACK")?.transaction_hash ?? undefined,

            unionTraceRecv?.traces?.find(v => v.type === "PACKET_SEND")?.transaction_hash ?? undefined,
            unionTraceRecv?.traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash ?? undefined,
            unionTraceRecv?.traces?.find(v => v.type === "PACKET_ACK")?.transaction_hash ?? undefined,
        ];

        return {
            percentage: ((hashes.filter(v => v !== undefined).length + (props.source === "local" ? 2 : 0)) / totalPhase * 100)
        };
    }, [props.source, totalPhase, unionTraceRecv?.traces, unionTraceSend?.traces]);

    const getFinishHash = useCallback(() => {
        let hash: string | undefined;
        if (unionTraceRecv?.success) {
            hash = unionTraceRecv?.traces?.find(v => v.type === "PACKET_ACK")?.transaction_hash ??
                unionTraceRecv?.traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash ??
                unionTraceRecv?.traces?.find(v => v.type === "PACKET_SEND")?.transaction_hash;
        }

        return hash;
    }, [unionTraceRecv?.success, unionTraceRecv?.traces]);

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
            {unionTraceSend?.traces ?
                <Accordion
                    type="single"
                    collapsible
                    className={`${!props.isTransactionPage && "mt-6"}`}
                    value={showDetails ? "item-1" : ""}
                    onValueChange={(value) => setShowDetails(value === "item-1")}
                >
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionContent className="p-0">
                            {props.operation === "bond" && !props.isTransactionPage &&
                                <div className="flex items-center gap-4 pb-4">
                                    <ChainTrace lst={lst} token={props.token} tokenReceive={props.tokenReceive} dest="send" />
                                    <div className="h-0.5 bg-escher-e4e8ed flex-1" />
                                    <div className="rounded-full aspect-square bg-white shadow-md p-2 shadow-escher-electricblue_light1">
                                        <Image alt="" src={"/icons/stake.svg"} width={16} height={16} />
                                    </div>
                                    <div className="h-0.5 bg-escher-e4e8ed flex-1" />
                                    <ChainTrace lst={lst} token={props.token} tokenReceive={props.tokenReceive} dest="recv" />
                                </div>
                            }
                            <div className={clsx(
                                "grid grid-cols-2 grid-flow-col p-0 items-stretch",
                                (props.isTransactionPage) ? "grid-rows-4" : "grid-rows-3",
                            )}>
                                {props.isTransactionPage &&
                                    <div className="flex items-start">
                                        <div className="min-w-[50%] bg-escher-F7F8FF dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-4 mb-6">
                                            <div className="text-xl font-semibold flex-1">{Number(props.amount)}</div>
                                            <TokenChain token={props.token} tokenSize={28} chainSize={14} />
                                        </div>
                                    </div>
                                }

                                <TraceComp
                                    border="left"
                                    type="PACKET_SEND"
                                    traces={unionTraceSend?.traces}
                                    title={"Send packet"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="left"
                                    type="PACKET_RECV"
                                    prevType="PACKET_SEND"
                                    traces={unionTraceSend?.traces}
                                    title={"Packet received"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="left"
                                    type="PACKET_ACK"
                                    prevType="PACKET_RECV"
                                    traces={unionTraceSend?.traces}
                                    title={"Packet acknowledged"}
                                    showLine={false}
                                    isTransactionPage={props.isTransactionPage}
                                />

                                {props.isTransactionPage &&
                                    <div className="flex items-start pl-4 border-l-2 border-escher-e4e8ed dark:border-escher-darkblue_border">
                                        <div className="min-w-[50%] bg-escher-F7F8FF dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-4 mb-6">
                                            <div className="text-xl font-semibold flex-1">{Number(props.estimateReceive)}</div>
                                            <TokenChain token={props.tokenReceive} tokenSize={28} chainSize={14} />
                                        </div>
                                    </div>
                                }

                                <TraceComp
                                    border="right"
                                    type="PACKET_SEND"
                                    traces={unionTraceRecv?.traces}
                                    title={"Send packet"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="right"
                                    type="PACKET_ACK"
                                    prevType="PACKET_SEND"
                                    traces={unionTraceRecv?.traces}
                                    title={"Packet received"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="right"
                                    type="PACKET_RECV"
                                    prevType="PACKET_ACK"
                                    traces={unionTraceRecv?.traces}
                                    title={"Packet acknowledged"}
                                    showLine={false}
                                    isTransactionPage={props.isTransactionPage}
                                />

                            </div>

                            {unionTraceSend?.packet_hash &&
                                <Link
                                    href={`https://app.union.build/explorer/packets/${unionTraceSend?.packet_hash}`}
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

export default UnionTraceTransferMulti;