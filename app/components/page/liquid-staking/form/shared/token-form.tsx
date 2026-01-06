import IconCircle from "@/components/global/iconCircle";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/configs/app";
import { textToNumberRegex } from "@/lib/text";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import Image from "next/image";
import RecipientForm from "./recipient-form";
import TokenSelection from "./token-selection";
import { useEscher } from "@/components/providers/escherProvider";

interface Props {
    amount?: string
    cosmosIsConnected: boolean
    enableInput: boolean
    enableRecipientAddressInput?: boolean
    enableTokenSelection: boolean
    evmIsConnected: boolean
    isLoading: boolean
    isReceive: boolean
    operation: Action
    recipientAddress?: string
    selectedToken: CustomToken
    skipTokenSelection?: boolean
    titleNetworkStep?: string
    titleTokenStep?: string
    tokens: CustomToken[]
    onAmountChange(val: string): void
    onRecipientAddressChange?(val: string): void
    onTokenSelected(token: CustomToken): void
}

const TokenForm = (props: Props) => {
    const { isSafe } = useEscher();

    return (
        <div className="border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg flex flex-col gap-2 p-6 mt-6 w-full">
            <div className="flex items-center justify-between text-escher-gray400 dark:text-escher-777e90 text-sm" onClick={() => console.log({ props })}>
                <div className="flex flex-row items-center gap-1">
                    {props.isReceive ?
                        "Receive"
                        :
                        props.operation === "bond" ? "Stake" : "Unstake"
                    }:
                    {APP_CONFIG.enableEvm && props.enableRecipientAddressInput && props.onRecipientAddressChange && (
                        <RecipientForm
                            defaultAddress={props.recipientAddress}
                            selectedToken={props.selectedToken}
                            onRecipientAddressChange={props.onRecipientAddressChange}
                        />
                    )}
                </div>
                <div className="text-escher-electricblue dark:text-white">
                    Balance: {formatNumber(Number(props.selectedToken.balance?.formattedBalance ?? '0'), false, 4)}
                </div>
            </div>
            <div className="flex items-stretch justify-between w-full">
                <div className="w-1/2">
                    <TokenSelection
                        evmIsConnected={props.evmIsConnected}
                        cosmosIsConnected={isSafe ? true : props.cosmosIsConnected}
                        selectedToken={props.selectedToken}
                        onTokenSelected={(t) => props.onTokenSelected(t)}
                        tokens={props.tokens}
                        enabled={props.enableTokenSelection}
                        titleTokenStep={props.titleTokenStep ?? `Select a token to ${props.isReceive ? 'receive' : 'stake'}`}
                        titleNetworkStep={props.titleNetworkStep}
                        skipTokenSelection={props.skipTokenSelection}
                    />
                </div>
                <div className="w-1/2 relative flex items-center justify-center">
                    {!props.isLoading ?
                        <input
                            className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                            disabled={!props.enableInput}
                            min={0}
                            onChange={e => {
                                let input = e.target.value;
                                try {
                                    const nativeEvent = e.nativeEvent as InputEvent;
                                    if (props.amount === "0" && /^\d$/.test(nativeEvent.data ?? "")) {
                                        input = nativeEvent.data!;
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                                const cleaned = textToNumberRegex(input, props.selectedToken.decimals);
                                if (cleaned !== undefined) {
                                    props.onAmountChange(cleaned);
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            type="text"
                            value={props.amount ?? "0"}
                        />
                        :
                        <div className="w-full flex items-end justify-end">
                            <LdrsAnimation />
                        </div>
                    }
                    {!props.isReceive &&
                        <button
                            onClick={() => {
                                if (props.selectedToken.balance) {
                                    props.onAmountChange(props.selectedToken.balance.formattedBalance);
                                }
                            }}
                            className="absolute right-2 text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-darkblue_2 hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                        >MAX</button>
                    }
                </div>
            </div>
            <div className="flex items-center justify-between text-escher-gray400 dark:text-escher-777e90">
                <div className="text-sm flex-1">on <span className="underline">{props.selectedToken.chain.name}</span></div>
                <div className="flex-1 flex items-center justify-between">

                    <div className="flex-1 flex items-center text-escher-777e90 text-sm font-medium">
                        {props.isReceive &&
                            <>
                                <Image src={"/images/points/flash.svg"} alt="" width={16} height={16} />
                                <div>+ Points</div>
                            </>
                        }
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                        <IconCircle
                            icon="BiTransferAlt"
                            className="bg-escher-dedfff dark:bg-escher-dark_384961 p-0 text-escher-electricblue dark:text-white rotate-90 w-4 h-4"
                            size="sm"
                        />
                        {props.selectedToken.balance?.dollarPerToken !== undefined &&
                            <div>${formatNumber(props.selectedToken.balance?.dollarPerToken * Number(props.amount), false, 4)}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TokenForm;
