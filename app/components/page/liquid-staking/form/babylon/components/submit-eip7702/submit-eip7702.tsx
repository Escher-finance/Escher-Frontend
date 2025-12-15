import Button from "@/components/global/button";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useState } from "react";
import { ButtonStatus } from "../../../shared/shared";
import Content from "./content-eip7702";

interface Props {
    address: `0x${string}`
    buttonStatus: ButtonStatus
    feeAmount: bigint
    feeToken: CustomToken
    inputAmount: string
    onError(msg: string | undefined): void
    operation: Action
    outputAmount: string
    quoteAmount: string
    refetch(): void
    slippage: string
    token: CustomToken
    tokenReceive: CustomToken
    unbondingTime: string
    recipientAddress: string
}

const SubmitEip7702 = (props: Props) => {
    const [open, setOpen] = useState(false);

    const closeModal = () => {
        props.refetch();
        setOpen(false)
    }

    const validateInput = () => {
        props.onError(undefined);
        // if (Number(props.inputAmount) <= 0) {
        //     props.onError("Invalid amount");
        //     return;
        // }
        // if (Number(props.outputAmount) <= 0) {
        //     props.onError("Invalid amount");
        //     return;
        // }
        // if (props.token.balance?.formattedBalance === undefined) {
        //     props.onError("Insufficient balance");
        //     return;
        // }
        // if (Number(props.token.balance?.formattedBalance) < Number(props.inputAmount)) {
        //     props.onError("Insufficient balance");
        //     return;
        // }

        setOpen(true);
    }

    return (
        <>
            <Button
                title={props.buttonStatus.text}
                enabled={props.buttonStatus.enabled}
                className="mt-6"
                onClick={validateInput}
            />
            <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
                <DialogContent
                    className="w-fit rounded-[20px] md:rounded-[20px] lg:rounded-[20px] border border-escher-E4E8ED dark:border-escher-darkblue_border"
                    aria-describedby=""
                    onPointerDownOutside={e => e.preventDefault()}
                >
                    <div className="flex flex-col w-full p-2">
                        <DialogTitle className="hidden"></DialogTitle>
                        <Content
                            address={props.address}
                            feeAmount={props.feeAmount}
                            feeToken={props.feeToken}
                            inputAmount={props.inputAmount}
                            onClose={closeModal}
                            operation={props.operation}
                            outputAmount={props.outputAmount}
                            quoteAmount={props.quoteAmount}
                            slippage={props.slippage}
                            token={props.token}
                            tokenReceive={props.tokenReceive}
                            unbondingTime={props.unbondingTime}
                            recipientAddress={props.recipientAddress}
                        />
                    </div>
                </DialogContent>
            </DialogEmpty >
        </>
    );
}

export default SubmitEip7702;
