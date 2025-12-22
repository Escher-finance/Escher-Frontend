"use client";

import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { useTheme } from "@/components/providers/themeProvider";
import { useOsmosisSqsDirect } from "@/hooks/defi/osmosis/useOsmosisSqs";
import { sleep } from "@/lib";
import { getErrorMessage } from "@/lib/error-msg";
import { textToNumberRegex } from "@/lib/text";
import { addThousandSeparators, formatDecimal, formatNumber } from "@/lib/utils";
import { SigningStargateClient } from "@cosmjs/stargate";
import { FEES } from "@osmonauts/utils";
import Image from "next/image";
import Link from "next/link";
import { getSigningOsmosisClient } from "osmojs";
import { MsgSwapExactAmountIn } from "osmojs/osmosis/gamm/v1beta1/tx";
import { useEffect, useMemo, useState } from "react";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "../../../ui/dialog-empty";
import Progress from "./_components/progress";
import Success from "./_components/success";
import TokenSelection from "./_components/token-selection";

interface Props {
    isApps?: boolean
    setOpen?(val: boolean): void
}

export default function SwapOsmosis(props: Props) {
    const [open, setOpen] = useState(false);
    const { themeIsDark } = useTheme();

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            {props.isApps ?
                <DialogTrigger asChild>
                    <Button title="Swap" className="mt-4" preComponent={<Image alt="" src={themeIsDark ? "/icons/reload-square-dark.svg" : "/icons/reload-square.svg"} />} />
                </DialogTrigger>
                :
                <DialogTrigger
                    className="flex items-center gap-2 p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg bg-linear-to-r from-[#ded7f3] to-75% hover:to-100% transition-all to-transparent"
                >
                    <div className="flex-1 flex items-center gap-2 leading-none">
                        <div className="text-escher-black text-xl font-bold">Swap on</div>
                        <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#c7b5f8]">
                            <Image src="/images/apps/app-osmosis-circle-2.svg" alt="" width={16} height={16} className="border border-white rounded-full" />
                            <div className="text-escher-text2 text-sm font-medium">Osmosis</div>
                        </div>
                    </div>
                    <div className="bg-escher-E2E3FF text-escher-electricblue rounded-full aspect-square flex items-center justify-center p-1">
                        <Icon type="LuMoveUpRight" />
                    </div>
                </DialogTrigger>
            }
            <DialogContent className="flex flex-col gap-3 w-fit p-0 bg-transparent border-none">
                <DialogTitle className="hidden"></DialogTitle>
                <Content
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty>
    );
}

// const testSwapTx = "6FF8C9C2FA8EED25E7DB182C1C40751BBECFEC0F4A0F29E23B354620506C1DCB";

const Content = (props: Props) => {
    const { escherTokens, account, refetchTokens, setOpenWalletConnection } = useEscher();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();
    const [successTxHash, setSuccessTxHash] = useState<string>();
    const [inputAmount, setInputAmount] = useState("0");
    const slippage = "0.1";

    const [osmoClient, setOsmoClient] = useState<SigningStargateClient>();

    const route = useOsmosisSqsDirect({
        amount: inputAmount,
        poolID: "3055",
        tokenIn: escherTokens.osmosis.ebaby,
        tokenOut: escherTokens.osmosis.baby
    });

    const outputAmount = useMemo(() => {
        if (inputAmount === "0" || inputAmount === "") return "0";

        const baseAmount = route.data?.amount_out_formatted;
        if (!baseAmount) return undefined;

        return baseAmount * ((100 - Number(slippage)) / 100);
    }, [inputAmount, route.data]);

    const submit = async () => {
        // DEBUG
        // setSuccessTxHash(testSwapTx);
        // return;

        setError(undefined);
        setIsPending(true);
        try {
            if (
                !osmoClient ||
                !account.cosmos?.address.osmosis ||
                !escherTokens.osmosis.ebaby.denom ||
                !escherTokens.osmosis.baby.denom
            ) return;

            const fee = FEES.osmosis.swapExactAmountIn();
            fee.gas = (Number(fee.gas) * 2).toFixed(0);

            const msgSwapExactAmountIn = MsgSwapExactAmountIn.fromPartial({
                sender: account.cosmos?.address.osmosis,
                tokenIn: {
                    amount: formatDecimal(Number(inputAmount), 6).toFixed(0),
                    denom: escherTokens.osmosis.ebaby.denom
                },
                tokenOutMinAmount: (Number(route.data?.route.amount_out) * ((100 - Number(slippage)) / 100)).toFixed(0),
                routes: [{
                    poolId: BigInt(3055),
                    tokenOutDenom: escherTokens.osmosis.baby.denom
                }]
            });
            const msg = {
                typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
                value: msgSwapExactAmountIn,
            };

            console.log({
                fee,
                msg
            });


            const res = await osmoClient.signAndBroadcast(account.cosmos?.address.osmosis, [msg], fee, "Osmosis swap");
            console.log({ res });
            await sleep(3);
            refetchTokens();
            await sleep(2);
            setSuccessTxHash(res.transactionHash);

        } catch (error) {
            console.error(error);
            setError(error as string);
        }
        setIsPending(false);
    }

    const submitButton = useMemo((): { active: boolean, text: string } => {
        if (!inputAmount || Number(inputAmount) <= 0) {
            return {
                active: false,
                text: "Swap"
            }
        }

        if (
            !escherTokens.osmosis.ebaby.balance?.value ||
            (Number(escherTokens.osmosis.ebaby.balance.value) < formatDecimal(Number(inputAmount), escherTokens.osmosis.ebaby.decimals))) {
            return {
                active: false,
                text: "Insufficient balance"
            }
        }

        if (route.isFetching) {
            return {
                active: false,
                text: "Fetching quote"
            }
        }

        if (route.error) {
            return {
                active: false,
                text: route.error.message
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
    }, [
        inputAmount,
        escherTokens.osmosis.ebaby.balance,
        escherTokens.osmosis.ebaby.decimals,
        route.isFetching,
        route.error,
        isPending
    ]);

    const errorMessage = useMemo(() => {
        return getErrorMessage(error);
    }, [error]);

    useEffect(() => {
        const getOsmoClient = async () => {
            if (account.cosmos?.chainContext === undefined) {
                setOsmoClient(undefined);
                return;
            }
            const rpcEndpoint = await account.cosmos?.chainContext?.osmosis?.getRpcEndpoint();
            const signer = account.cosmos?.chainContext?.osmosis?.getOfflineSigner();

            if (!rpcEndpoint || !signer) {
                return;
            }

            const client = await getSigningOsmosisClient({
                rpcEndpoint: rpcEndpoint,
                signer
            });

            // reason : osmojs's SigningStargateClient can't be used, probably different version
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setOsmoClient(client as any);
        }
        getOsmoClient();
    }, [account.cosmos?.chainContext, osmoClient]);

    if (successTxHash) {
        return <Success
            token={escherTokens.osmosis.ebaby}
            amount={inputAmount}
            hash={successTxHash}
            setOpen={props.setOpen}
        />
    }

    if (isPending) {
        return <Progress
            inputAmount={inputAmount}
            outputAmount={outputAmount?.toString() ?? "0"}
            tokenA={escherTokens.osmosis.ebaby}
            tokenB={escherTokens.osmosis.baby}
        />
    }

    return (
        <div className="w-[536px] flex flex-col bg-white dark:bg-escher-darkblue rounded-lg">
            <div className="flex justify-between items-center bg-linear-to-r from-[#ded7f3] to-transparent rounded-t-lg p-6">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div className="text-escher-black text-xl font-bold" onClick={() => {
                        console.log({
                            route
                        })
                    }}>Swap</div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#c7b5f8]">
                        <Image src="/images/apps/app-osmosis-circle-2.svg" alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 text-sm font-medium">Osmosis</div>
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
                <div className="flex flex-col p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg mt-2">
                    <div className="flex justify-between">

                        <TokenSelection
                            enabled={false}
                            tokens={[]}
                            selectedToken={escherTokens.osmosis.ebaby}
                            onTokenSelected={() => { }}
                        />

                        <div className="w-1/2 relative self-stretch flex items-center justify-center">
                            <input
                                type="text"
                                placeholder="0"
                                value={inputAmount}
                                onChange={e => {
                                    const input = textToNumberRegex(e.target.value);
                                    if (input) {
                                        setInputAmount(input);
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                            />
                            <button
                                onClick={() => {
                                    if (escherTokens.osmosis.ebaby?.balance) {
                                        setInputAmount(escherTokens.osmosis.ebaby?.balance.formattedBalance);
                                    }
                                }}
                                className="absolute right-2 text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-darkblue_2 hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                            >MAX</button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                        <div className="flex items-center gap-2">
                            <Image src="/icons/wallet.svg" alt="" />
                            {escherTokens.osmosis.ebaby?.balance?.formattedBalance ?
                                <div>{addThousandSeparators(escherTokens.osmosis.ebaby?.balance?.formattedBalance)}</div>
                                :
                                <LdrsAnimation size={10} />
                            }
                        </div>
                        {escherTokens.osmosis.ebaby?.coingeckoPrice ?
                            <div>${formatNumber(Number(inputAmount) * Number(escherTokens.osmosis.ebaby?.coingeckoPrice), false, 4)}</div>
                            :
                            <LdrsAnimation size={10} />
                        }
                    </div>
                </div>

                <div className="text-escher-text4 dark:text-white text-sm mt-6">You receive</div>
                <div className="flex flex-col p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg mt-2">
                    <div className="flex justify-between">

                        <TokenSelection
                            enabled={false}
                            tokens={[]}
                            selectedToken={escherTokens.osmosis.baby}
                            onTokenSelected={() => { }}
                        />

                        <div className="w-1/2 relative self-stretch flex items-center justify-center">
                            {route.isFetching ?
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
                            {escherTokens.osmosis.baby.balance?.formattedBalance ?
                                <div>{addThousandSeparators(escherTokens.osmosis.baby.balance?.formattedBalance)}</div>
                                :
                                <LdrsAnimation size={10} />
                            }
                        </div>
                        {escherTokens.osmosis.baby.coingeckoPrice ?
                            <div>${formatNumber(Number(outputAmount) * Number(escherTokens.osmosis.baby.coingeckoPrice), false, 4)}</div>
                            :
                            <LdrsAnimation size={10} />
                        }
                    </div>
                </div>

                {errorMessage &&
                    <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2 mt-4">
                        <Icon type="FaExclamationTriangle" />
                        <div className="max-h-[100px] overflow-scroll">{errorMessage.join(". ")}</div>
                    </div>
                }

                {account.cosmos?.isConnected ?
                    <Button
                        title={submitButton.text}
                        enabled={submitButton.active}
                        onClick={submit}
                        className="mt-10"
                    />
                    :
                    <Button
                        title='Connect wallet'
                        onClick={() => setOpenWalletConnection(true)}
                        className="grow text-sm px-4 mt-2 whitespace-nowrap gap-2"
                        preComponent={
                            <Image src="/icons/wallet_icon.svg" width={24} height={24} alt="" />
                        }
                    />
                }

                <div className="text-escher-text4 dark:text-white text-sm text-center mt-4">Swap executed via <Link className="text-escher-electricblue dark:text-white underline font-medium" href={"https://app.osmosis.zone/"} target="_blank">Osmosis</Link> DEX, a third-party service provider</div>
            </div>
        </div>
    );
}