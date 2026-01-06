import Button from "@/components/global/button";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { APP_CONFIG } from "@/configs/app";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { ChainContext } from "@cosmos-kit/core";
import { useState } from "react";
import { PublicClient, WalletClient } from "viem";
import { ButtonStatus } from "../../../shared/shared";
import Content from "./content";

interface Props {
    amount: string
    buttonStatus: ButtonStatus
    cosmosChainContext?: ChainContext
    estimateReceive?: string
    operation: Action
    publicClient?: PublicClient
    recipientAddress?: string
    token: CustomToken
    tokenReceive: CustomToken
    unbondingTime: string
    walletClient?: WalletClient
    onError(msg: string | undefined): void
    refetch(): void
}

const Submit = (props: Props) => {

    const [open, setOpen] = useState(false);

    const closeModal = () => {
        props.refetch();
        setOpen(false)
    }

    const validateInput = () => {
        props.onError(undefined);
        if (Number(props.amount) <= 0) {
            props.onError("Invalid amount");
            return;
        }
        if (Number(props.estimateReceive) <= 0) {
            props.onError("Invalid amount");
            return;
        }
        if (props.token.balance?.formattedBalance === undefined) {
            props.onError("Insufficient balance");
            return;
        }
        if (Number(props.token.balance?.formattedBalance) < Number(props.amount)) {
            props.onError("Insufficient balance");
            return;
        }
        if (Number(props.amount) < APP_CONFIG.minimumAmount) {
            props.onError(`Minimum ${props.operation === "bond" ? "stake" : "unstake"} amount is ${APP_CONFIG.minimumAmount}`);
            return;
        }

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
                    className="w-fit rounded-[20px] md:rounded-[20px] lg:rounded-[20px] border border-escher-e4e8ed dark:border-escher-darkblue_border"
                    aria-describedby=""
                    onPointerDownOutside={e => e.preventDefault()}
                >
                    <div className="flex flex-col w-full p-2">
                        <DialogTitle className="hidden"></DialogTitle>
                        {props.recipientAddress &&
                            <Content
                                amount={props.amount}
                                cosmosChainContext={props.cosmosChainContext}
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
