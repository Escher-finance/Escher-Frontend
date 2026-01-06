import Icon from "@/components/global/icons"
import { EscherAccount } from "@/components/providers/escherProvider"
import { APP_CONFIG } from "@/configs/app"
import { CustomToken } from "@/types/chain"
import { Action } from "@/types/transaction"
import { ChainContext } from "@cosmos-kit/core"
import { PublicClient, WalletClient } from "viem"
import { ButtonStatus } from "../../shared/shared"
import TokenForm from "../../shared/token-form"
import { SubmitButton } from "./submit-button"

// TODO way to much params, need to refactor
export interface FormProps {
    account: EscherAccount
    buttonStatus: ButtonStatus
    cosmosChainContext: ChainContext | undefined
    error?: string
    fInputAmount: string
    fRecipientAddress?: string
    inputTokens: CustomToken[]
    operation: Action
    outputAmount?: string
    outputTokens: CustomToken[]
    publicClient?: PublicClient
    selectedInputToken: CustomToken
    selectedOutputToken: CustomToken
    unbondingTime: string
    walletClient?: WalletClient
    setError(val: string | undefined): void
    setFCustomAddress(val: string | undefined): void
    setFInputAmount(val: string): void
    setFInputAmount(val: string): void
    setOpenWalletConnection(val: boolean): void
    setSelectedInputTokenId(val: string): void
    setSelectedInputTokenId(val: string): void
    setSelectedOutputTokenId(val: string): void
    setSelectedOutputTokenId(val: string): void
    tokenRefetch(): void
}

export const SubmitForm = (props: FormProps) => {
    return (
        <>
            {/* Input */}
            <TokenForm
                amount={props.fInputAmount}
                enableInput={true}
                enableTokenSelection={APP_CONFIG.enableEvm}
                skipTokenSelection={true}
                evmIsConnected={props.account.evm?.isConnected ?? false}
                cosmosIsConnected={props.account.cosmos?.isConnected !== undefined}
                isLoading={false}
                isReceive={false}
                onAmountChange={val => props.setFInputAmount(val)}
                onTokenSelected={token => props.setSelectedInputTokenId(token.id)}
                operation={props.operation}
                selectedToken={props.selectedInputToken}
                tokens={props.inputTokens}
            />

            {/* Output */}
            <TokenForm
                amount={props.outputAmount}
                enableInput={false}
                enableTokenSelection={APP_CONFIG.enableEvm}
                enableRecipientAddressInput={false}
                skipTokenSelection={true}
                evmIsConnected={props.account.evm?.isConnected ?? false}
                cosmosIsConnected={props.account.cosmos?.isConnected !== undefined}
                isLoading={(
                    Number(props.fInputAmount) > 0 &&
                    props.outputAmount === undefined
                )}
                isReceive={true}
                onAmountChange={() => { }}
                onTokenSelected={token => props.setSelectedOutputTokenId(token.id)}
                onRecipientAddressChange={props.setFCustomAddress}
                recipientAddress={props.fRecipientAddress}
                operation={props.operation}
                selectedToken={props.selectedOutputToken}
                tokens={props.outputTokens}
            />

            {props.error &&
                <div className="bg-orange-100 text-orange-800 p-2 font-medium rounded-lg mt-4 flex items-center gap-2">
                    <Icon type="FaExclamationTriangle" />
                    <div>{props.error}</div>
                </div>
            }

            <SubmitButton
                buttonStatus={props.buttonStatus}
                cosmosChainContext={props.cosmosChainContext}
                cosmosIsConnected={props.account.cosmos?.isConnected ?? false}
                evmIsConnected={props.account.evm?.isConnected ?? false}
                fInputAmount={props.fInputAmount}
                onOpenWallet={() => props.setOpenWalletConnection(true)}
                operation={props.operation}
                outputAmount={props.outputAmount}
                publicClient={props.publicClient}
                selectedInputToken={props.selectedInputToken}
                selectedOutputToken={props.selectedOutputToken}
                setError={props.setError}
                tokenRefetch={() => {
                    props.tokenRefetch();
                }}
                unbondingTime={props.unbondingTime}
                walletClient={props.walletClient}
                recipientAddress={props.fRecipientAddress}
            />
        </>
    );
}