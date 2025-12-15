import Button from "@/components/global/button";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { ChainContext } from "@cosmos-kit/core";
import { PublicClient, WalletClient } from "viem";
import { ButtonStatus } from "../../shared/shared";
import Submit from "./submit/submit";

interface Props {
    buttonStatus: ButtonStatus
    cosmosChainContext?: ChainContext
    cosmosIsConnected: boolean
    evmIsConnected: boolean
    fInputAmount: string
    operation: Action
    outputAmount?: string
    publicClient?: PublicClient
    recipientAddress?: string
    selectedInputToken: CustomToken
    selectedOutputToken: CustomToken
    unbondingTime: string
    walletClient?: WalletClient
    onOpenWallet(): void
    setError(error: string | undefined): void
    tokenRefetch: () => void
}

export const SubmitButton = (props: Props) => {
    const isSourceEVM = props.selectedInputToken.chain.network === "evm";
    const isSourceCosmos = props.selectedInputToken.chain.network === "cosmos";

    if (
        (isSourceCosmos && !props.cosmosIsConnected) ||
        (isSourceEVM && !props.evmIsConnected)
    ) {
        return (
            <Button
                title="Connect wallet"
                onClick={props.onOpenWallet}
                className="mt-6"
            />
        );
    }

    return (
        <Submit
            buttonStatus={props.buttonStatus}
            amount={props.fInputAmount}
            cosmosChainContext={props.cosmosChainContext}
            estimateReceive={props.outputAmount}
            onError={(error) => props.setError(error)}
            operation={props.operation}
            publicClient={props.publicClient}
            refetch={props.tokenRefetch}
            token={props.selectedInputToken}
            tokenReceive={props.selectedOutputToken}
            unbondingTime={props.unbondingTime}
            walletClient={props.walletClient}
            recipientAddress={props.recipientAddress}
        />
    );
};
