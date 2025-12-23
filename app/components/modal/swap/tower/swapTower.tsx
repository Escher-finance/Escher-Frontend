"use client";

import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { useTheme } from "@/components/providers/themeProvider";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { useSkipClient, useSkipSimulation } from "@/hooks/useSkip";
import { textToNumberRegex } from "@/lib/text";
import { addThousandSeparators, formatDecimal, formatNumber } from "@/lib/utils";
import { useChain } from "@cosmos-kit/react";
import { RouteRequest } from "@skip-go/client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "../../../ui/dialog-empty";
import Success from "./_components/success";

interface Props {
    isApps?: boolean
    setOpen?(val: boolean): void
}

export default function SwapTower(props: Props) {
    const { themeIsDark } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            {props.isApps ?
                <DialogTrigger asChild>
                    <Button title="Swap" className="mt-4" preComponent={<Image alt="" src={themeIsDark ? "/icons/reload-square-dark.svg" : "/icons/reload-square.svg"} width={18} height={18} />} />
                </DialogTrigger>
                :
                <DialogTrigger
                    className="flex items-center gap-2 p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg bg-linear-to-r from-[#FBEBC8] to-75% hover:to-100% transition-all to-transparent"
                >
                    <div className="flex-1 flex items-center gap-2 leading-none">
                        <div className="text-escher-black text-xl font-bold">Swap on</div>
                        <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#FAE5B9]">
                            <Image src="/images/apps/app-tower-circle.png" alt="" width={16} height={16} className="border border-white rounded-full" />
                            <div className="text-escher-text2 text-sm font-medium">Tower</div>
                        </div>
                    </div>
                    <div className="bg-escher-E2E3FF text-escher-electricblue rounded-full aspect-square flex items-center justify-center h-full p-1">
                        <Icon type="LuMoveUpRight" />
                    </div>
                </DialogTrigger>
            }
            <DialogContent className="flex flex-col gap-3 w-fit p-0">
                <DialogTitle className="hidden"></DialogTitle>
                <Content
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty>
    );
}

const Content = (props: Props) => {
    const { tokens: allTokens } = useEscher();
    const tokens = useMemo(() => {
        return {
            baby: allTokens.find(v => v.id === `${CHAINS.babylon.id}`),
            eBaby: allTokens.find(v => v.id === `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`),
        }
    }, [allTokens]);

    const cosmosChain = useChain(CHAINS.babylon.chainName ?? "");
    const cw20 = "cw20:bbn1s7jzz7cyuqmy5xpr07yepka5ngktexsferu2cr4xeww897ftj77sv30f5s";

    const [fInput, setFInput] = useState<string>("0");
    const [error, setError] = useState<string>();
    const [successHash, setSuccessHash] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const { skipClient } = useSkipClient();

    const routeRequest = useMemo((): RouteRequest | undefined => {
        if (!fInput || Number(fInput) <= 0) return undefined;

        return {
            swapVenues: [
                {
                    chainID: CHAINS.babylon.id as string,
                    name: "babylon-tower",
                },
            ],
            sourceAssetDenom: cw20,
            sourceAssetChainID: CHAINS.babylon.id as string,
            destAssetDenom: "ubbn",
            destAssetChainID: CHAINS.babylon.id as string,
            amountIn: formatDecimal(Number(fInput), 6).toFixed(0),
            allowSwaps: true,
            allowUnsafe: true,
        };
    }, [fInput]);

    const simulation = useSkipSimulation({
        skipClient, routeRequest
    });

    const errorSimulation = useMemo(() => {
        if (simulation.isSuccess) return undefined;
        return simulation.error?.message;
    }, [simulation.isSuccess, simulation.error]);

    const slippageTolerancePercent = undefined;

    const submit = async () => {
        if (!cosmosChain.address || !simulation.data) return;
        setIsLoading(true);
        setError(undefined);
        setSuccessHash(undefined);

        try {
            await skipClient?.executeRoute({
                route: simulation.data,
                slippageTolerancePercent,
                userAddresses: simulation.data.requiredChainAddresses.map((chainID) => ({
                    chainID,
                    address: cosmosChain.address ?? "",
                })),
                onTransactionSigned: async ({ chainID }) => {
                    console.log({
                        title: "Succesfully Signed",
                        description: `Transaction signed with chain ID: ${chainID}`,
                    });
                },
                onTransactionCompleted: async (chainID, txHash, status) => {
                    console.log({
                        title: "Success",
                        chainID, txHash, status,
                    });
                    setSuccessHash(txHash)
                },
            });

        } catch (error) {
            console.error(error);
            setError(String(error));
        }

        setIsLoading(false);
    };

    const submitButton = useMemo((): { active: boolean, text: string } => {
        if (isLoading) {
            return {
                active: false,
                text: "processing..."
            }
        }

        if (!fInput || Number(fInput) <= 0) {
            return {
                active: false,
                text: "Swap"
            }
        }

        if (
            !tokens.eBaby?.balance?.value ||
            (Number(tokens.eBaby.balance.value) < formatDecimal(Number(fInput), 6))) {
            return {
                active: false,
                text: "Insufficient balance"
            }
        }

        if (simulation.isFetching) {
            return {
                active: false,
                text: "Fetching quote"
            }
        }

        if (errorSimulation) {
            if (errorSimulation.includes("no routes found")) {
                return {
                    active: false,
                    text: "No routes found"
                }
            }
            return {
                active: false,
                text: "Swap"
            }
        }

        return {
            active: true,
            text: "Swap"
        }
    }, [isLoading, fInput, simulation.isFetching, errorSimulation, tokens.eBaby]);

    const outputComponent = useMemo(() => {
        if (errorSimulation) {
            return (
                <div className="text-escher-gray900 dark:text-white h-full font-semibold text-2xl">0</div>
            );
        }
        if (simulation.isFetching) {
            return <LdrsAnimation />
        }
        return (
            <div className="text-escher-gray900 dark:text-white h-full font-semibold text-2xl">{simulation.data?.amountOut ? formatDecimal(Number(simulation.data?.amountOut), -6) : "0"}</div>
        );
    }, [simulation.data?.amountOut, simulation.isFetching, errorSimulation]);

    if (successHash && tokens.eBaby) {
        return <Success
            token={tokens.eBaby}
            amount={fInput}
            hash={successHash}
            setOpen={props.setOpen}
        />
    }

    return (
        <div className="min-w-[585px] flex flex-col">
            <div className="flex justify-between items-center bg-linear-to-r from-[#FBEBC8] to-transparent rounded-t-lg p-6">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div className="text-escher-black text-xl font-bold">Swap</div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#FAE5B9]">
                        <Image src="/images/apps/app-tower-circle.png" alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 text-sm font-medium">Tower</div>
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
                {tokens.eBaby &&
                    <div className="flex flex-col p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg mt-2">
                        <div className="flex justify-between">
                            <div className="w-fit flex items-center  gap-2 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-full bg-escher-f5f6f8 dark:bg-escher-darkblue p-3 pr-4">
                                {tokens.eBaby.icon &&
                                    <Image src={tokens.eBaby.icon} alt="" width={24} height={24} />
                                }
                                <div className="text-xl font-semibold text-escher-black dark:text-white">{tokens.eBaby.symbol}</div>
                            </div>

                            <div className="w-1/2 relative self-stretch flex items-center justify-center">
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={fInput}
                                    onChange={e => {
                                        const input = textToNumberRegex(e.target.value);
                                        if (input) {
                                            setFInput(input);
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                                />
                                <button
                                    onClick={() => {
                                        if (tokens.eBaby?.balance) {
                                            setFInput(tokens.eBaby.balance.formattedBalance);
                                        }
                                    }}
                                    className="absolute right-2 text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-darkblue_2 hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                                >MAX</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                            <div className="flex items-center gap-2">
                                <Image src="/icons/wallet.svg" alt="" width={16} height={16} />
                                {tokens.eBaby.balance?.formattedBalance ?
                                    <div>{addThousandSeparators(tokens.eBaby.balance?.formattedBalance)}</div>
                                    :
                                    <LdrsAnimation size={10} />
                                }
                            </div>
                            {tokens.eBaby.balance?.dollarValue ?
                                <div>${formatNumber(Number(fInput) * Number(tokens.eBaby.balance?.dollarPerToken), false, 4)}</div>
                                :
                                <LdrsAnimation size={10} />
                            }
                        </div>
                    </div>
                }

                <div className="text-escher-text4 dark:text-white text-sm mt-6">You receive</div>
                {tokens.baby &&
                    <div className="flex flex-col p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg mt-2">
                        <div className="flex justify-between items-center">
                            <div className="w-fit flex items-center  gap-2 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-full bg-escher-f5f6f8 dark:bg-escher-darkblue p-3 pr-4">
                                {tokens.baby.icon &&
                                    <Image src={tokens.baby.icon} alt="" width={24} height={24} />
                                }
                                <div className="text-xl font-semibold text-escher-black dark:text-white">{tokens.baby.symbol}</div>
                            </div>
                            {outputComponent}
                        </div>
                        <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                            <div className="flex items-center gap-2">
                                <Image src="/icons/wallet.svg" alt="" width={16} height={16} />
                                {tokens.baby.balance?.formattedBalance ?
                                    <div>{addThousandSeparators(tokens.baby.balance?.formattedBalance)}</div>
                                    :
                                    <LdrsAnimation size={10} />
                                }
                            </div>
                            {tokens.baby.balance?.dollarValue && simulation.data?.amountOut &&
                                <div>${(formatNumber(formatDecimal(Number(simulation.data?.amountOut), -6) * Number(tokens.baby.balance?.dollarPerToken), false, 4))}</div>
                            }
                        </div>
                    </div>
                }

                {
                    error &&
                    <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2 mt-4">
                        <Icon type="FaExclamationTriangle" />
                        <div className="max-h-[100px] overflow-scroll">{error}</div>
                    </div>
                }

                <Button
                    title={submitButton.text}
                    enabled={submitButton.active}
                    onClick={submit}
                    className="mt-10"
                />

                <div className="text-escher-text4 dark:text-white text-sm text-center mt-4">Swap executed via <Link className="text-escher-electricblue dark:text-white underline font-medium" href={"https://app.tower.fi/swap"} target="_blank">Tower</Link> DEX, a third-party service provider</div>
            </div>
        </div>
    );
}