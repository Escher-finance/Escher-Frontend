"use client";

import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import UnionTraceBond from "./bond";
import UnionTraceDust from "./dust";
import UnionTransfer from "./transfer";
import UnionTraceUnbond from "./unbond";
import UnionTraceWithdraw from "./withdraw";
import UnionTraceTransferMulti from "./transferMulti";

export interface TraceProps {
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
    lst?: "babylon" | "union"
}

export default function UnionTrace(props: TraceProps) {
    switch (props.operation) {
        case "bond": {
            switch (props.lst) {
                case "union":
                    return <UnionTraceBond {...props} />

                case "babylon":
                    return <UnionTraceTransferMulti {...props} />
            }
            break;
        }
        case "unbond": return <UnionTraceUnbond {...props} />
        case "towerRemove":
        case "towerAdd":
        case "bridge": return <UnionTransfer {...props} />
        case "dust": return <UnionTraceDust {...props} />
        case "withdraw": return <UnionTraceWithdraw {...props} />
    }
}