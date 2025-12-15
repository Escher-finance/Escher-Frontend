import Icon from "@/components/global/icons";
import UnionTrace from "@/components/global/unionTrace/unionTrace";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useState } from "react";
import Success from "./success";

interface Props {
    successTxHash?: string
    onClose(): void
    amount: string
    operation: Action
    token: CustomToken
}

export default function WithdrawTraces(props: Props) {
    return (
        <DialogEmpty open={props.successTxHash !== undefined} onOpenChange={() => props.onClose()}>
            <DialogContent
                className="w-fit rounded-[20px] md:rounded-[20px] lg:rounded-[20px] border border-escher-E4E8ED dark:border-escher-darkblue_border"
                aria-describedby=""
                onPointerDownOutside={e => e.preventDefault()}
            >
                <div className="flex flex-col w-full p-2">
                    <DialogTitle className="hidden"></DialogTitle>
                    <Content {...props} />
                </div>
            </DialogContent>
        </DialogEmpty >
    );
}

const Content = (props: Props) => {
    const [finalHash, setFinalHash] = useState<string>();

    if (finalHash) {
        return <Success
            onClose={props.onClose}
            chainId={props.token.chain.id}
            hash={finalHash}
        />;
    }

    return (
        <div className="w-[620px] flex flex-col p-4 dark:text-white">
            <div className="flex items-center justify-between">
                <div className="text-xl font-bold">TRANSACTION IN PROGRESS</div>
                <button
                    className="rounded-full border border-gray-300 text-gray-400 p-1.5"
                    onClick={props.onClose}
                >
                    <Icon type="FaTimes" />
                </button>
            </div>

            <div className="self-start flex items-center gap-2 bg-escher-dedfff dark:bg-escher-darkblue text-escher-electricblue dark:text-white text-sm font-medium rounded-full px-2 py-1 mt-4 dark:border dark:border-escher-darkblue_border">
                <Icon type="FiClock" size="sm" />
                <div>15~20 mins</div>
            </div>

            <div className="text-escher-gray500 dark:text-gray-400 mt-2">You can close this because its happening in the background.</div>

            {props.successTxHash &&
                <UnionTrace
                    amount={props.amount}
                    estimateReceive={"0"}
                    // DEBUG
                    // Comment onFinalHash to prevent showing success page
                    onFinalHash={hash => setFinalHash(hash)}
                    operation={props.operation}
                    source="local"
                    successTxHash={props.successTxHash}
                    token={props.token}
                    tokenReceive={props.token}
                    lst={"union"}
                />
            }
        </div >
    );
}