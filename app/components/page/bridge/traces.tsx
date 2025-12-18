import Icon from "@/components/global/icons";
import UnionTransfer from "@/components/global/unionTrace/transfer";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useState } from "react";
import Success from "./success";

interface Props {
    amount: string
    open: boolean
    setOpen(val: boolean): void
    operation: Action
    successTxHash: string
    tokenIn: CustomToken
    tokenOut: CustomToken
}

const Traces = (props: Props) => {
    const [finalHash, setFinalHash] = useState<string>();

    if (finalHash) {
        return <Success
            operation={props.operation}
            chainId={props.tokenIn.chain.id}
            hash={props.successTxHash}
            open={props.open}
            setOpen={props.setOpen}
        />;
    }

    return (
        <DialogEmpty open={props.open} onOpenChange={props.setOpen}>
            <DialogContent
                className="w-fit rounded-[20px] md:rounded-[20px] lg:rounded-[20px] border border-escher-e4e8ed dark:border-escher-darkblue_border dark:text-white"
                aria-describedby=""
                onPointerDownOutside={e => e.preventDefault()}
            >
                <div className="flex flex-col w-full p-2">
                    <DialogTitle className="hidden"></DialogTitle>

                    <div className="w-[620px] flex flex-col p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-bold">BRIDGE IN PROGRESS</div>
                            <button
                                className="rounded-full border border-gray-300 text-gray-400 p-1.5"
                                onClick={() => props.setOpen(false)}
                            >
                                <Icon type="FaTimes" />
                            </button>
                        </div>

                        {props.tokenIn.chain.network === "evm" &&
                            <div className="self-start flex items-center gap-2 bg-escher-dedfff dark:bg-escher-darkblue_2 text-escher-electricblue dark:text-white text-sm font-medium rounded-full px-2 py-1 mt-4">
                                <Icon type="FiClock" size="sm" />
                                <div>20 mins</div>
                            </div>
                        }

                        {props.operation === "bond" &&
                            <div className="self-start flex items-center gap-2 bg-escher-dedfff text-escher-electricblue dark:text-white text-sm font-medium rounded-full px-2 py-1 mt-4">
                                <Icon type="FiClock" size="sm" />
                                <div>20 mins</div>
                            </div>
                        }
                        <div className="text-escher-gray500 dark:text-white mt-2">You can close this because its happening in the background.</div>

                        <UnionTransfer
                            amount={props.amount}
                            estimateReceive={props.amount}
                            // DEBUG
                            // Comment onFinalHash to prevent showing success page
                            onFinalHash={hash => setFinalHash(hash)}
                            operation={props.operation}
                            source="local"
                            successTxHash={props.successTxHash}
                            token={props.tokenIn}
                            tokenReceive={props.tokenOut}
                        />
                    </div >
                </div>
            </DialogContent>
        </DialogEmpty >
    );
}

export default Traces;