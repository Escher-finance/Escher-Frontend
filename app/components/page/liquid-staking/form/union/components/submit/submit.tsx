import Button from "@/components/global/button";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useState } from "react";
import { PublicClient, WalletClient } from "viem";
import { ButtonStatus } from "../../../shared/shared";
import Content from "./content";

interface Props {
    amount: string
    buttonStatus: ButtonStatus
    estimateReceive?: string
    onError(msg: string | undefined): void
    operation: Action
    publicClient?: PublicClient
    recipientAddress?: string
    refetch(): void
    token: CustomToken
    tokenReceive: CustomToken
    unbondingTime: string
    walletClient?: WalletClient
}

const Submit = (props: Props) => {

    const [open, setOpen] = useState(false);

    const closeModal = () => {
        props.refetch();
        setOpen(false)
    }

    const validateInput = () => {
        props.onError(undefined);
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
                        {props.recipientAddress &&
                            <Content
                                amount={props.amount}
                                estimateReceive={props.estimateReceive ?? "0"}
                                onClose={closeModal}
                                operation={props.operation}
                                publicClient={props.publicClient}
                                token={props.token}
                                tokenReceive={props.tokenReceive}
                                unbondingTime={props.unbondingTime}
                                walletClient={props.walletClient}
                                recipientAddress={props.recipientAddress}
                            />
                        }
                    </div>
                </DialogContent>
            </DialogEmpty >
        </>
    );
}

export default Submit;
