import Button from "@/components/global/button";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { PublicClient, WalletClient } from "viem";
import { useChainId, useSwitchChain } from "wagmi";
import { ButtonStatus } from "../../shared/shared";
import Submit from "./submit/submit";

interface Props {
    buttonStatus: ButtonStatus
    eipIsPending?: boolean
    cosmosIsConnected: boolean
    evmIsConnected: boolean
    fInputAmount: string
    onOpenWallet(): void
    operation: Action
    outputAmount?: string
    publicClient?: PublicClient
    recipientAddress?: string
    selectedInputToken: CustomToken
    selectedOutputToken: CustomToken
    setError(error: string | undefined): void
    tokenRefetch: () => void
    unbondingTime: string
    walletClient?: WalletClient
}

export const SubmitButton = (props: Props) => {
    const chainId = useChainId();
    const { switchChain, isPending } = useSwitchChain();

    if (!props.evmIsConnected) {
        return (
            <Button
                title="Connect wallet"
                onClick={props.onOpenWallet}
                className="mt-6"
            />
        );
    }

    if (chainId !== props.selectedInputToken.chain.id) {
        if (isPending) {
            return (
                <Button
                    title="switching chain..."
                    enabled={false}
                    className="mt-6"
                />
            );
        }
        return (
            <Button
                title="Switch chain"
                onClick={() => switchChain({ chainId: Number(props.selectedInputToken.chain.id) })}
                className="mt-6"
            />
        );
    }

    return (
        <Submit
            amount={props.fInputAmount}
            buttonStatus={props.buttonStatus}
            estimateReceive={props.outputAmount ?? "0"}
            onError={(error) => props.setError(error)}
            operation={props.operation}
            publicClient={props.publicClient}
            recipientAddress={props.recipientAddress}
            refetch={props.tokenRefetch}
            token={props.selectedInputToken}
            tokenReceive={props.selectedOutputToken}
            unbondingTime={props.unbondingTime}
            walletClient={props.walletClient}
        />
    );
};
