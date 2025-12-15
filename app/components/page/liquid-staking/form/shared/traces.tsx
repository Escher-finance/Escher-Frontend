import Icon from "@/components/global/icons";
import UnionTrace from "@/components/global/unionTrace/unionTrace";
import { CustomToken, LiquidStaking } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useState } from "react";
import Success from "./success";

interface Props {
    amount: string
    estimateReceive: string
    onClose(): void
    operation: Action
    successTxHash: string
    token: CustomToken
    tokenReceive: CustomToken
    unbondingTime: string
    lst: LiquidStaking
}

const Traces = (props: Props) => {
    const [finalHash, setFinalHash] = useState<string>();

    if (finalHash) {
        return <Success
            chainId={props.token.chain.id}
            hash={props.lst === "babylon" ? props.successTxHash : undefined}
            lst={props.lst}
            onClose={props.onClose}
            operation={props.operation}
            unbondingTime={props.unbondingTime}
        />;
    }

    return (
        <div className="w-[620px] flex flex-col p-4 dark:text-white">
            <div className="flex items-center justify-between">
                <div
                    className="text-xl font-bold"
                    onClick={() => console.log({ props })}
                >TRANSACTION IN PROGRESS</div>
                <button
                    className="rounded-full border border-gray-300 text-gray-400 p-1.5"
                    onClick={props.onClose}
                >
                    <Icon type="FaTimes" />
                </button>
            </div>

            {props.operation === "bond" &&
                <div className="self-start flex items-center gap-2 bg-escher-dedfff dark:bg-escher-darkblue text-escher-electricblue dark:text-white text-sm font-medium rounded-full px-2 py-1 mt-4 dark:border dark:border-escher-darkblue_border">
                    <Icon type="FiClock" size="sm" />
                    <div>15~20 mins</div>
                </div>
            }

            {props.operation === "unbond" &&
                <div className="text-escher-gray500 dark:text-gray-400 mt-2">
                    Unstaking requires an unbonding period of approximately {props.unbondingTime}.
                    {props.lst === "babylon" && <>
                        <br />After that, <b>your tokens will be automatically deposited into your wallet.</b>
                    </>}
                </div>
            }
            <div className="text-escher-gray500 dark:text-gray-400">You can close this because its happening in the background.</div>

            <UnionTrace
                amount={props.amount}
                estimateReceive={props.estimateReceive}
                // DEBUG
                // Comment onFinalHash to prevent showing success page
                onFinalHash={hash => setFinalHash(hash)}
                operation={props.operation}
                source="local"
                successTxHash={props.successTxHash}
                token={props.token}
                tokenReceive={props.tokenReceive}
                lst={props.lst}
            />
        </div >
    );
}

export default Traces;