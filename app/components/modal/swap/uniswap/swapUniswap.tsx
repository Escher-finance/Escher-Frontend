"use client";

import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { useTheme } from "@/components/providers/themeProvider";
import { useUniswapSwap } from "@/hooks/defi/uniswap/useUniswapSwap";
import { useUniswapRoute } from "@/hooks/useUniswap";
import { getErrorMessage } from "@/lib/error-msg";
import { textToNumberRegex } from "@/lib/text";
import { addThousandSeparators, formatDecimal, formatNumber } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "../../../ui/dialog-empty";
import Progress from "./_components/progress";
import Success from "./_components/success";
import TokenSelection from "./_components/token-selection";

interface Props {
    initialTokenId: string
    isApps?: boolean
    setOpen?(val: boolean): void
}

export default function SwapUniswap(props: Props) {
    const [open, setOpen] = useState(false);
    const { themeIsDark } = useTheme();

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            {props.isApps ?
                <DialogTrigger asChild>
                    <Button title="Swap" className="mt-4" preComponent={<Image src={themeIsDark ? "/icons/reload-square-dark.svg" : "/icons/reload-square.svg"} alt="" />} />
                </DialogTrigger>
                :
                <DialogTrigger
                    className="flex items-center gap-2 p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg bg-linear-to-r from-[#fdc3ec] to-75% hover:to-100% transition-all to-transparent"
                >
                    <div className="flex-1 flex items-center gap-2 leading-none">
                        <div className="text-escher-black text-xl font-bold">Swap on</div>
                        <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#fdc3ec]">
                            <Image src="/images/apps/app-uniswap-circle-2.svg" alt="" width={16} height={16} className="border border-white rounded-full" />
                            <div className="text-escher-text2 text-sm font-medium">Uniswap</div>
                        </div>
                    </div>
                    <div className="bg-escher-E2E3FF text-escher-electricblue rounded-full aspect-square flex items-center justify-center p-1">
                        <Icon type="LuMoveUpRight" />
                    </div>
                </DialogTrigger>
            }
            <DialogContent className="flex flex-col gap-3 w-fit p-0 bg-transparent dark:bg-transparent border-none">
                <DialogTitle className="hidden"></DialogTitle>
                <Content
                    initialTokenId={props.initialTokenId}
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty>
    );
}

// const testSwapTx = "0x1f84df29eb8456f75accf7d0d4ba7553db5f4168756fede9356e9a81dc37c930";

const Content = (props: Props) => {
    const { escherTokens, account, setOpenWalletConnection } = useEscher();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const { swap, statusOperation, statusPrepare } = useUniswapSwap();
    const [successTxHash, setSuccessTxHash] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();

    const [amount, setAmount] = useState<string>("0");
    const autoSlippage = "5.5";
    const [slippage] = useState<string>(autoSlippage);

    // Tokens
    // Input
    const inputTokens = useMemo(() => {
        return [
            escherTokens.evm.ebaby,
            escherTokens.evm.eU,
        ];
    }, [escherTokens]);

    const [selectedInputTokenId, setSelectedInputTokenId] = useState(props.initialTokenId);
    const selectedInputToken = useMemo(() => (inputTokens.find(v => v.id === selectedInputTokenId) ?? inputTokens[0]),
        [inputTokens, selectedInputTokenId]);

    // Output
    const outputTokens = useMemo(() => {
        switch (selectedInputToken.symbol) {
            case "eBaby":
                return [escherTokens.evm.baby];
            case "eU":
                return [escherTokens.evm.u];
        }
        return [escherTokens.evm.baby];
    }, [escherTokens, selectedInputToken]);

    const [selectedOutputTokenId, setSelectedOutputTokenId] = useState(outputTokens[0].id);
    const selectedOutputToken = useMemo(() => (outputTokens.find(v => v.id === selectedOutputTokenId) ?? outputTokens[0]),
        [outputTokens, selectedOutputTokenId]);

    // Uniswap route
    const uniswapRoute = useUniswapRoute({
        userAddress: (account.evm?.address as `0x${string}` | undefined),
        inputToken: selectedInputToken,
        outputToken: selectedOutputToken,
        amount: amount,
        slippage: slippage,
        forceSwap: true
    });

    const quote = useMemo(() => {
        return uniswapRoute.data ? uniswapRoute.data.quote.toExact() : undefined;
    }, [uniswapRoute.data]);

    const outputAmount = useMemo(() => {
        const baseAmount = quote;
        if (!baseAmount) return undefined;

        const numericAmount = Number(baseAmount);
        return numericAmount.toFixed(selectedOutputToken.decimals).replace(/\.?0+$/, "");
    }, [quote, selectedOutputToken.decimals]);

    const submit = async () => {
        if (
            !publicClient ||
            !walletClient ||
            !uniswapRoute.data
        ) throw "invalid data";

        setIsPending(true);

        try {
            const res = await swap({
                amount: amount,
                publicClient: publicClient,
                walletClient: walletClient,
                route: uniswapRoute.data,
                tokenIn: selectedInputToken,
                tokenOut: selectedOutputToken,
            });

            setSuccessTxHash(res);

        } catch (error) {
            console.error(error);
            setError(getErrorMessage(String(error))?.join(". "));
        }

        setIsPending(false);
    }

    const submitButton = useMemo((): { active: boolean, text: string } => {
        if (!amount || Number(amount) <= 0 || !quote) {
            return {
                active: false,
                text: "Swap"
            }
        }

        if (
            !selectedInputToken?.balance?.value ||
            (Number(selectedInputToken.balance.value) < formatDecimal(Number(amount), selectedInputToken.decimals))) {
            return {
                active: false,
                text: "Insufficient balance"
            }
        }

        if (uniswapRoute.isFetching) {
            return {
                active: false,
                text: "Fetching quote"
            }
        }

        if (uniswapRoute.error) {
            return {
                active: false,
                text: uniswapRoute.error.message
            }
        }

        if (isPending) {
            return {
                active: false,
                text: "Swapping..."
            }
        }

        return {
            active: true,
            text: "Swap"
        }
    }, [amount, quote, selectedInputToken.balance, selectedInputToken.decimals, uniswapRoute.isFetching, uniswapRoute.error, isPending]);

    if (successTxHash) {
        return <Success
            token={selectedInputToken}
            amount={amount}
            hash={successTxHash}
            setOpen={props.setOpen}
        />
    }

    if (isPending) {
        return <Progress
            inputAmount={amount}
            outputAmount={outputAmount ?? "0"}
            statusOperation={statusOperation}
            statusPrepare={statusPrepare}
            tokenA={selectedInputToken}
            tokenB={selectedOutputToken}
        />
    }

    return (
        <div className="w-[536px] flex flex-col bg-white dark:bg-escher-darkblue rounded-lg">
            <div className="flex justify-between items-center bg-linear-to-r from-[#FFDDF5] to-transparent rounded-t-lg p-6">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div className="text-escher-black text-xl font-bold" onClick={() => {
                        console.log(uniswapRoute.error)
                    }}>Swap</div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#fdc3ec]">
                        <Image src="/images/apps/app-uniswap-circle-2.svg" alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 text-sm font-medium">Uniswap</div>
                    </div>
                </div>
                <button
                    className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                    onClick={() => props.setOpen && props.setOpen(false)}
                >
                    <Icon type="FaTimes" />
                </button>
            </div>
            <div className="flex flex-col p-6">

                <div className="text-escher-text4 dark:text-white text-sm">You send</div>
                <div className="flex flex-col p-6 border border-[#e4e8ed] dark:border-escher-darkblue_border rounded-lg mt-2">
                    <div className="flex justify-between">

                        <TokenSelection
                            enabled={true}
                            tokens={inputTokens.filter(t => t.id !== selectedOutputToken.id)}
                            selectedToken={selectedInputToken}
                            onTokenSelected={token => setSelectedInputTokenId(token.id)}
                        />

                        <div className="w-1/2 relative self-stretch flex items-center justify-center">
                            <input
                                type="text"
                                placeholder="0"
                                value={amount}
                                onChange={e => {
                                    const input = textToNumberRegex(e.target.value);
                                    if (input) {
                                        setAmount(input);
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                            />
                            <button
                                onClick={() => {
                                    if (selectedInputToken?.balance) {
                                        setAmount(selectedInputToken.balance.formattedBalance);
                                    }
                                }}
                                className="absolute right-2 text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-darkblue_2 hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                            >MAX</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                        <div className="flex items-center gap-2">
                            <Image src="/icons/wallet.svg" alt="" />
                            {selectedInputToken.balance?.formattedBalance ?
                                <div>{addThousandSeparators(selectedInputToken.balance?.formattedBalance)}</div>
                                :
                                <LdrsAnimation size={10} />
                            }
                        </div>
                        {selectedInputToken.balance?.dollarValue ?
                            <div>${formatNumber(Number(amount) * Number(selectedInputToken.balance?.dollarPerToken), false, 4)}</div>
                            :
                            <LdrsAnimation size={10} />
                        }
                    </div>
                </div>

                <div className="text-escher-text4 dark:text-white text-sm mt-6">You receive</div>
                <div className="flex flex-col p-6 border border-[#e4e8ed] dark:border-escher-darkblue_border rounded-lg mt-2">
                    <div className="flex justify-between">

                        <TokenSelection
                            enabled={false}
                            tokens={outputTokens.filter(t => t.id !== selectedInputToken.id)}
                            selectedToken={selectedOutputToken}
                            onTokenSelected={token => setSelectedOutputTokenId(token.id)}
                        />

                        <div className="w-1/2 relative self-stretch flex items-center justify-center">
                            {uniswapRoute.isFetching ?
                                <div className="w-full flex items-end justify-end">
                                    <LdrsAnimation />
                                </div>
                                :
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={outputAmount}
                                    disabled
                                    onFocus={(e) => e.target.select()}
                                    className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                                />
                            }
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                        <div className="flex items-center gap-2">
                            <Image src="/icons/wallet.svg" alt="" />
                            {selectedOutputToken.balance?.formattedBalance ?
                                <div>{addThousandSeparators(selectedOutputToken.balance?.formattedBalance)}</div>
                                :
                                <LdrsAnimation size={10} />
                            }
                        </div>
                        {selectedOutputToken.balance?.dollarValue ?
                            <div>${formatNumber(Number(outputAmount) * Number(selectedOutputToken.balance?.dollarPerToken), false, 4)}</div>
                            :
                            <LdrsAnimation size={10} />
                        }
                    </div>
                </div>

                {error &&
                    <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2 mt-4">
                        <Icon type="FaExclamationTriangle" />
                        <div className="max-h-[100px] overflow-scroll">{error}</div>
                    </div>
                }

                {account.evm?.isConnected ?
                    <Button
                        title={submitButton.text}
                        enabled={submitButton.active}
                        onClick={submit}
                        className="mt-10"
                    />
                    :
                    <Button
                        title="Connect wallet"
                        onClick={() => setOpenWalletConnection(true)}
                        className="mt-10"
                    />
                }

                <div className="text-escher-text4 dark:text-white text-sm text-center mt-4">Swap executed via <Link className="text-escher-electricblue dark:text-white underline font-medium" href={"https://uniswap.org/"} target="_blank">Uniswap</Link> DEX, a third-party service provider</div>
            </div>
        </div>
    );
}