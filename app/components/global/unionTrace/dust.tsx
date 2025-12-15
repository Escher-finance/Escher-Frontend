"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUnionTraceDust } from "@/hooks/unionIndexer/dust";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "../icons";
import LdrsAnimation from "../ldrsAnimation";
import { ChainTrace, TraceComp } from "./components";
import { TraceProps } from "./unionTrace";

const UnionTraceDust = (props: TraceProps) => {
    const lst = props.lst ?? "babylon";
    const [showDetails, setShowDetails] = useState(true);
    const { data: unionTraceDust } = useUnionTraceDust(props.successTxHash);

    useEffect(() => {
        const getFinishHash = () => {
            let hash: string | undefined;
            if (unionTraceDust?.delivery_success) {
                hash = unionTraceDust?.delivery_traces?.find(v => v.type === "PACKET_ACK")?.transaction_hash ??
                    unionTraceDust?.delivery_traces?.find(v => v.type === "PACKET_RECV")?.transaction_hash ??
                    unionTraceDust?.delivery_traces?.find(v => v.type === "PACKET_SEND")?.transaction_hash;
            }
            return hash;
        }
        const checkFinalHash = () => {
            const hash = getFinishHash();
            if (hash && props.onFinalHash) {
                props.onFinalHash(hash);
            }
        }
        checkFinalHash();
    }, [props, unionTraceDust?.delivery_success, unionTraceDust?.delivery_traces]);

    return (
        <div className={`w-full flex flex-col ${props.className}`}>
            {unionTraceDust?.dust_withdraw_traces ?
                <Accordion
                    type="single"
                    collapsible
                    className={`${!props.isTransactionPage && "mt-6"}`}
                    value={showDetails ? "item-1" : ""}
                    onValueChange={(value) => setShowDetails(value === "item-1")}
                >
                    <AccordionItem value="item-1" className="border-none">
                        <AccordionContent className="p-0">
                            <div className="flex items-center gap-4 pb-4">
                                <ChainTrace lst={lst} token={props.token} tokenReceive={props.tokenReceive} dest="send" />
                                <div className="h-0.5 bg-escher-e4e8ed flex-1" />
                                <div className="rounded-full aspect-square bg-white shadow-md p-2 shadow-escher-electricblue_light1">
                                    <Icon type="MdGrain" className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="h-0.5 bg-escher-e4e8ed flex-1" />
                                <ChainTrace lst={lst} token={props.token} tokenReceive={props.tokenReceive} dest="recv" />
                            </div>

                            <div className={clsx(
                                "grid grid-cols-2 grid-flow-col p-0 items-stretch grid-rows-3",
                            )}>
                                <TraceComp
                                    border="left"
                                    type="PACKET_SEND"
                                    traces={unionTraceDust?.dust_withdraw_traces}
                                    title={"Send packet"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="left"
                                    type="PACKET_RECV"
                                    prevType="PACKET_SEND"
                                    traces={unionTraceDust?.dust_withdraw_traces}
                                    title={"Packet received"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="left"
                                    type="PACKET_ACK"
                                    prevType="PACKET_RECV"
                                    traces={unionTraceDust?.dust_withdraw_traces}
                                    title={"Packet acknowledged"}
                                    showLine={false}
                                    isTransactionPage={props.isTransactionPage}
                                />

                                <TraceComp
                                    border="right"
                                    type="PACKET_SEND"
                                    traces={unionTraceDust?.delivery_traces}
                                    title={"Send packet"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="right"
                                    type="PACKET_RECV"
                                    prevType="PACKET_SEND"
                                    traces={unionTraceDust?.delivery_traces}
                                    title={"Packet received"}
                                    isTransactionPage={props.isTransactionPage}
                                />
                                <TraceComp
                                    border="right"
                                    type="PACKET_ACK"
                                    prevType="PACKET_RECV"
                                    traces={unionTraceDust?.delivery_traces}
                                    title={"Packet acknowledged"}
                                    showLine={false}
                                    isTransactionPage={props.isTransactionPage}
                                />

                            </div>

                            {unionTraceDust?.packet_hash &&
                                <Link
                                    href={`https://app.union.build/explorer/packets/${unionTraceDust?.packet_hash}`}
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

export default UnionTraceDust;