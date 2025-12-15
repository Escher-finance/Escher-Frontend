"use client";

import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import TokenChain from "@/components/global/tokenChain";
import { useEscher } from "@/components/providers/escherProvider";
import { useCosmosBridge } from "@/hooks/bridge/useCosmosBridge";
import { textToNumberRegex } from "@/lib/text";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import Image from "next/image";
import { useMemo, useState } from "react";
import Success from "./_components/success";

interface Props {
    setOpen?(val: boolean): void
}

export default function BridgeMultiple(props: Props) {
    const { account, escherTokens } = useEscher();
    const { bridgeMultiple, successHash, isPending } = useCosmosBridge();
    const [fAmount0, setFAmount0] = useState("0");
    const [fAmount1, setFAmount1] = useState("0");

    const { token0, token1, recipient } = useMemo(() => ({
        token0: escherTokens.babylon.ebaby,
        token1: escherTokens.babylon.baby,
        recipient: account.cosmos?.address.osmosis
    }), [escherTokens.babylon, account.cosmos]);

    const buttonStatus = useMemo((): { enabled: boolean, text: string } => {
        if (Number(fAmount0) <= 0 || Number(fAmount1) <= 0) {
            return {
                enabled: false,
                text: "Enter an amount"
            }
        }

        if (
            Number(fAmount0) > Number(token0?.balance?.formattedBalance ?? "0") ||
            Number(fAmount1) > Number(token1?.balance?.formattedBalance ?? "0")
        ) {
            return {
                enabled: false,
                text: "Insufficient balance"
            }
        }

        if (!recipient) {
            return {
                enabled: false,
                text: "Osmosis not connected"
            }
        }

        return {
            enabled: true,
            text: "Bridge to Osmosis"
        }
    }, [fAmount0, fAmount1, token0, token1, recipient]);

    const submit = () => {
        if (
            !account.cosmos?.chainContext?.babylon ||
            !account.cosmos.address.babylon ||
            !account.cosmos.address.osmosis
        ) {
            console.error({
                cosmos: account.cosmos
            });

            return;
        }

        bridgeMultiple({
            senderAddress: account.cosmos?.address.babylon,
            recipientAddress: account.cosmos.address.osmosis,
            chainContext: account.cosmos.chainContext?.babylon,
            amount0: fAmount0,
            amount1: fAmount1,
        });
    }

    if (successHash) {
        return (
            <Success
                amount0={fAmount0}
                amount1={fAmount1}
                token0={token0}
                token1={token1}
                hash={successHash}
                setOpen={() => props.setOpen && props.setOpen(false)}
            />
        );
    }

    return (
        <div className="w-[536px] flex flex-col bg-white dark:bg-escher-darkblue rounded-lg">
            <div className="flex justify-between items-center bg-linear-to-r from-[#ded7f3] to-transparent rounded-t-lg p-6">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div
                        className="text-escher-black text-xl font-bold"
                        onClick={() => console.log({})}
                    >Bridge</div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#c7b5f8]">
                        <Image src={"/images/escher-blue-circle.png"} alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 text-sm font-medium">Escher</div>
                    </div>
                </div>
                <button
                    className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                    onClick={() => props.setOpen && props.setOpen(false)}
                >
                    <Icon type="FaTimes" />
                </button>
            </div>
            <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-8 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg p-6">
                    <TokenInput
                        amount={fAmount0}
                        onAmountChange={setFAmount0}
                        token={token0}
                    />
                    <TokenInput
                        amount={fAmount1}
                        onAmountChange={setFAmount1}
                        token={token1}
                    />
                </div>

                <Button
                    title={buttonStatus.text}
                    enabled={buttonStatus.enabled}
                    isLoading={isPending}
                    onClick={submit}
                />
            </div >
        </div >
    );
}

interface TokenInputProps {
    token: CustomToken
    amount: string
    onAmountChange(val: string): void
}

const TokenInput = (props: TokenInputProps) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-12">
                <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue p-3 rounded-full">
                        <TokenChain token={props.token} tokenSize={38} chainSize={18} />
                        <div className="flex flex-col">
                            <div className="text-xl font-semibold text-escher-141416 dark:text-white leading-none">{props.token.symbol}</div>
                            <div className="text-escher-777e90 text-sm leading-none">Babylon</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <input
                        className="flex-1 border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full text-end"
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
                            const cleaned = textToNumberRegex(input, props.token.decimals);
                            if (cleaned !== undefined) {
                                props.onAmountChange(cleaned);
                            }
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        type="text"
                        value={props.amount ?? "0"}
                    />
                </div>
            </div>
            <div className="flex justify-between">
                <div className="flex items-center gap-1 text-escher-777e90 text-sm">
                    <Image src="/icons/wallet.svg" alt="" className="w-4 h-4" />
                    <div>{props.token.balance?.formattedBalance}</div>
                </div>
                {props.token.coingeckoPrice &&
                    <div className="flex items-center gap-1 text-escher-777e90 text-sm">
                        ${formatNumber(props.token.coingeckoPrice * Number(props.amount))}
                    </div>
                }
            </div>
        </div>
    );
}