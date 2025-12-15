"use client";

import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import {
    DialogContent,
    DialogEmpty,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog-empty";
import { useUniswapAddLiquidity } from "@/hooks/defi/uniswap/useUniswapAddLiquidity";
import { useUniswapPool } from "@/hooks/defi/uniswap/useUniswapDefi";
import { getErrorMessage } from "@/lib/error-msg";
import { textToNumberRegex } from "@/lib/text";
import {
    addThousandSeparators,
    formatDecimal,
    formatNumber,
} from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Defi, DefiPool } from "@/types/defi";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import Progress from "./_components/progress";
import Success from "./_components/success";

interface Props {
    defi: Defi
    pool: DefiPool
    isApps?: boolean
    open?: boolean
    onRemoveModalOpen?(): void
    setOpen?(val: boolean): void
}

export default function AddLiquidityUniswap(props: Props) {
    const open = props.open ?? false
    const setOpen = props.setOpen ?? (() => { })

    return (
        <DialogEmpty open={open} onOpenChange={(v) => setOpen(v)}>
            {props.isApps ? (
                <DialogTrigger className="h-6 aspect-square bg-escher-D9DAFF dark:bg-white hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                    <Image alt="" src={"/icons/arrow-down-blue.svg"} />
                </DialogTrigger>
            ) : (
                <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                    Add
                </DialogTrigger>
            )}
            <DialogContent className="flex flex-col gap-3 w-fit p-0 bg-transparent border-none">
                <DialogTitle className="hidden"></DialogTitle>

                <Content
                    defi={props.defi}
                    pool={props.pool}
                    open={props.open}
                    setOpen={setOpen}
                    onRemoveModalOpen={props.onRemoveModalOpen}
                />
            </DialogContent>
        </DialogEmpty>
    );
}

// const testSuccessHash = "0x3bfa2d20e2bb7e7080ca14bb4d745742a1cbd43e44d0807d4c34aeacb3275af5";

const Content = (props: Props) => {
    const { account, tokens: appTokens } = useEscher();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const queryPool = useUniswapPool({
        address: account.evm?.address as `0x${string}` | undefined,
        pool: props.pool,
        publicClient: publicClient,
    });

    const {
        mintPosition,
        addPosition,
        statusPrepare,
        statusApproval0,
        statusApproval1,
        statusOperation
    } = useUniswapAddLiquidity();

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();
    const [successTxHash, setSuccessTxHash] = useState<string>();

    const priceRatio = useMemo(() => {
        if (!queryPool.ratio) return undefined;

        return queryPool.ratio;
    }, [queryPool]);

    const [fTokenAAmount, setFTokenAAmount] = useState("0");
    const [fTokenBAmount, setFTokenBAmount] = useState("0");

    const tokens = useMemo(
        () => ({
            a: appTokens.find((t) => t.id === props.pool.tokenA.id),
            b: appTokens.find((t) => t.id === props.pool.tokenB.id),
        }),
        [appTokens, props.pool.tokenA.id, props.pool.tokenB.id],
    );

    const submit = async () => {
        if (
            !queryPool.pool ||
            !account.evm?.address ||
            !publicClient ||
            !walletClient
        ) {
            return;
        }

        setIsPending(true);
        try {
            let hash;
            if (queryPool.position?.tokenId) {
                hash = await addPosition({
                    amountA: fTokenAAmount,
                    amountB: fTokenBAmount,
                    pool: props.pool,
                    positionId: queryPool.position?.tokenId.toString(),
                    uniswapPool: queryPool.pool,
                    publicClient,
                    walletClient,
                });
            } else {
                hash = await mintPosition({
                    amountA: fTokenAAmount,
                    amountB: fTokenBAmount,
                    pool: props.pool,
                    uniswapPool: queryPool.pool,
                    publicClient,
                    walletClient,
                });
            }
            setSuccessTxHash(hash);
        } catch (error) {
            setError(getErrorMessage(String(error))?.join(". "));
        }
        setIsPending(false);
    };

    const buttonStatus = useMemo((): { active: boolean; text: string } => {
        if (
            !fTokenAAmount ||
            Number(fTokenAAmount) <= 0 ||
            !fTokenBAmount ||
            Number(fTokenBAmount) <= 0
        ) {
            return {
                active: false,
                text: "Enter amount",
            };
        }

        if (
            !tokens.a?.balance?.value ||
            !tokens.b?.balance?.value ||
            Number(tokens.a?.balance?.value) <
            formatDecimal(Number(fTokenAAmount), tokens.a.decimals) ||
            Number(tokens.b?.balance?.value) <
            formatDecimal(Number(fTokenBAmount), tokens.b.decimals)
        ) {
            return {
                active: false,
                text: "Insufficient balance",
            };
        }

        if (!priceRatio) {
            return {
                active: false,
                text: "Fetching pool data...",
            };
        }

        if (isPending) {
            return {
                active: false,
                text: "Processing...",
            };
        }

        if (queryPool.pool && !queryPool.position) {
            return {
                active: true,
                text: "Mint position",
            };
        }

        return {
            active: true,
            text: "Add liquidity",
        };
    }, [fTokenAAmount, fTokenBAmount, isPending, priceRatio, queryPool.pool, queryPool.position, tokens.a, tokens.b]);

    const inRange = useMemo(() =>
        queryPool.position?.isInRange,
        // false,
        [queryPool.position?.isInRange]
    );

    if (successTxHash) {
        return (
            <Success
                pool={props.pool}
                fTokenAAmount={fTokenAAmount}
                fTokenBAmount={fTokenBAmount}
                hash={successTxHash}
                setOpen={props.setOpen}
            />
        );
    }

    if (isPending && tokens.a && tokens.b) {
        return (
            <Progress
                defi={props.defi}
                inputAmount={fTokenAAmount}
                outputAmount={fTokenBAmount}
                statusApproval0={statusApproval0}
                statusApproval1={statusApproval1}
                statusOperation={statusOperation}
                statusPrepare={statusPrepare}
                tokenA={tokens.a}
                tokenB={tokens.b}
            />
        );
    }

    return (
        <div className="min-w-[400px] flex flex-col bg-white dark:bg-escher-darkblue rounded-lg">
            <div className="flex justify-between items-center bg-linear-to-r from-[#FFDDF5] to-transparent rounded-t-lg p-4">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div
                        className="text-escher-black text-xl font-bold"
                        onClick={() => console.log({ queryPool })}
                    >
                        Add Liquidity
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#fdc3ec]">
                        <Image
                            src={props.defi.logoURI}
                            alt=""
                            width={16}
                            height={16}
                            className="border border-white rounded-full"
                        />
                        <div className="text-escher-text2 text-sm font-medium">
                            {props.defi.name}
                        </div>
                    </div>
                </div>
                <button
                    className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                    onClick={() => props.setOpen && props.setOpen(false)}
                >
                    <Icon type="FaTimes" />
                </button>
            </div>
            <div className="flex flex-col p-4">
                <div className="flex flex-col gap-2 p-4 border border-[#e4e8ed] dark:border-escher-darkblue_border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {tokens.a?.icon && (
                                <Image
                                    src={tokens.a?.icon}
                                    alt=""
                                    width={40}
                                    height={40}
                                />
                            )}
                            {tokens.b?.icon && (
                                <Image
                                    src={tokens.b?.icon}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="z-10 -ml-4"
                                />
                            )}
                            <div className="flex flex-col ml-4">
                                <div className="text-sm font-medium text-escher-black dark:text-white">
                                    {tokens.a?.symbol} / {tokens.b?.symbol}
                                </div>
                                <div className="flex items-center gap-1 font-medium text-escher-777e90 text-sm">
                                    <Image
                                        src={props.defi.logoURI}
                                        width={18}
                                        height={18}
                                        alt=""
                                    />
                                    <div>{props.defi.name}</div>
                                </div>
                            </div>
                        </div>
                        {inRange !== undefined &&
                            <div className={clsx(
                                "flex items-center font-semibold text-sm px-2 py-1.5 rounded gap-2",
                                inRange ? "bg-green-700 text-green-100" : "bg-yellow-700 text-yellow-100"
                            )}>
                                <Icon type={inRange ? "FaCheck" : "FaExclamationTriangle"} size="sm" />
                                <div className="leading-none">{inRange ? "In range" : "Out of range"}</div>
                            </div>
                        }
                    </div>
                    {inRange === false ?
                        <div className="flex flex-col gap-2">
                            <div className="font-medium text-sm text-gray-700 dark:text-gray-400">
                                Your position is out of range, please withdraw and redeposit to update your price band.
                            </div>
                            <Button title="Withdraw" onClick={() => {
                                props.setOpen?.(false);
                                props.onRemoveModalOpen?.();
                            }} />
                        </div>
                        :
                        <div className="font-medium text-sm text-gray-700 dark:text-gray-400">
                            You&apos;re adding liquidity to a PCL pool with a ±2% price range. <br />
                            Only liquidity within this range earns fees.<br />
                            If your position falls out of range, please withdraw and redeposit to update your price band.
                        </div>
                    }
                </div>

                <div className="text-sm text-escher-777e90 leading-none mt-6">
                    Deposit Amount
                </div>

                {!priceRatio && (
                    <div className="flex items-center justify-center my-4">
                        <LdrsAnimation />
                    </div>
                )}

                {priceRatio && (
                    <>
                        {/* Token A */}
                        {tokens.a &&
                            <TokenInput
                                token={tokens.a}
                                amount={fTokenAAmount}
                                onAmountChange={(value) => {
                                    setFTokenAAmount(value);
                                    setFTokenBAmount(
                                        parseFloat(
                                            (
                                                Number(value) /
                                                (priceRatio ?? 1)
                                            ).toFixed(6),
                                        ).toString(),
                                    );
                                }}
                                onMax={() => {
                                    if (tokens.a?.balance) {
                                        setFTokenAAmount(tokens.a?.balance.formattedBalance,);
                                        setFTokenBAmount(
                                            parseFloat(
                                                (Number(tokens.a?.balance.formattedBalance) * (priceRatio ?? 1)).toFixed(6),
                                            ).toString(),
                                        );
                                    }
                                }}
                            />
                        }

                        {/* Token B */}
                        {tokens.b &&
                            <TokenInput
                                token={tokens.b}
                                amount={fTokenBAmount}
                                className="mt-4"
                                onAmountChange={(value) => {
                                    setFTokenBAmount(value);
                                    setFTokenAAmount(
                                        parseFloat(
                                            (Number(value) * (priceRatio ?? 1)).toFixed(6),
                                        ).toString(),
                                    );
                                }}
                                onMax={() => {
                                    if (tokens.b?.balance) {
                                        setFTokenBAmount(tokens.b?.balance.formattedBalance);
                                        setFTokenAAmount(
                                            parseFloat(
                                                (Number(tokens.b?.balance.formattedBalance) / (priceRatio ?? 1)).toFixed(6)
                                            ).toString(),
                                        );
                                    }
                                }}
                            />
                        }
                    </>
                )}

                {error && (
                    <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2 mt-4">
                        <Icon type="FaExclamationTriangle" />
                        <div className="max-h-[100px] overflow-scroll">
                            {error}
                        </div>
                    </div>
                )}

                <Button
                    onClick={submit}
                    title={buttonStatus.text}
                    enabled={buttonStatus.active}
                    className="mt-10"
                />

                <div className="text-sm text-escher-777e90 mt-2 text-center">
                    LP interaction executed via{" "}
                    <Link
                        href={props.defi.link}
                        className="text-escher-electricblue dark:text-white"
                        target="_blank"
                    >
                        {props.defi.name}
                    </Link>{" "}
                    DEX, a third-party service provider.
                </div>
            </div>
        </div>
    );
};

const TokenInput = (props: {
    token: CustomToken
    amount: string
    className?: string
    onAmountChange(val: string): void
    onMax(): void
}) => {
    return (
        <div
            className={clsx(
                "dark:bg-escher-dark_0c203d flex flex-col p-4 border border-[#e4e8ed] dark:border-escher-darkblue_border rounded-lg mt-2",
                props.className
            )}>
            <div className="flex justify-between">
                <div className="w-fit flex items-center gap-2 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-full bg-escher-f5f6f8 dark:bg-escher-darkblue px-2 py-1.5 pr-3">
                    {props.token.icon && (
                        <Image
                            src={props.token.icon}
                            alt=""
                            width={24}
                            height={24}
                        />
                    )}
                    <div className="text-xl font-semibold text-escher-black dark:text-white">
                        {props.token.symbol}
                    </div>
                </div>

                <div className="w-1/2 relative self-stretch flex items-center justify-center">
                    <input
                        type="text"
                        placeholder="0"
                        value={props.amount}
                        onChange={(e) => {
                            const input = textToNumberRegex(
                                e.target.value,
                            );
                            if (input) {
                                props.onAmountChange(input);
                            }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f5ff dark:bg-escher-darkblue text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                    />
                    <button
                        onClick={props.onMax}
                        className="absolute right-2 text-escher-electricblue dark:text-white bg-escher-dedfff dark:bg-escher-darkblue_2 hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                    >
                        MAX
                    </button>
                </div>
            </div>
            <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                <div className="flex items-center gap-2">
                    <Image alt="" src="/icons/wallet.svg" />
                    {props.token.balance?.formattedBalance ? (
                        <div>
                            {addThousandSeparators(
                                props.token.balance
                                    ?.formattedBalance,
                            )}
                        </div>
                    ) : (
                        <LdrsAnimation size={10} />
                    )}
                </div>
                {props.token.balance?.dollarValue ? (
                    <div>
                        $
                        {formatNumber(
                            Number(
                                props.token.balance?.dollarValue,
                            ),
                        )}
                    </div>
                ) : (
                    <LdrsAnimation size={10} />
                )}
            </div>
        </div>
    );
}