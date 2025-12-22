"use client";

import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { useEscher } from "@/components/providers/escherProvider";
import {
    DialogContent,
    DialogEmpty,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog-empty";
import { Slider } from "@/components/ui/slider";
import { useUniswapPool } from "@/hooks/defi/uniswap/useUniswapDefi";
import { useUniswapRemoveLiquidity } from "@/hooks/defi/uniswap/useUniswapRemoveLiquidity";
import { getErrorMessage } from "@/lib/error-msg";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Defi, DefiPool } from "@/types/defi";
import { Percent } from "@uniswap/sdk-core";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import Progress from "./_components/progress";
import Success from "./_components/success";
import clsx from "clsx";

interface Props {
    defi: Defi;
    pool: DefiPool;
    isApps?: boolean;
    open?: boolean
    setOpen?(val: boolean): void;
}

export default function RemoveLiquidityUniswap(props: Props) {
    const open = props.open ?? false
    const setOpen = props.setOpen ?? (() => { })

    return (
        <DialogEmpty open={open} onOpenChange={(v) => setOpen(v)}>
            {props.isApps ? (
                <DialogTrigger className="h-6 aspect-square bg-escher-D9DAFF dark:bg-white hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                    <Image src={"/icons/arrow-up-blue.svg"} alt="" width={18} height={18} />
                </DialogTrigger>
            ) : (
                <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                    Remove
                </DialogTrigger>
            )}
            <DialogContent className="flex flex-col gap-3 w-fit p-0 bg-transparent border-none">
                <DialogTitle className="hidden"></DialogTitle>

                <Content
                    defi={props.defi}
                    pool={props.pool}
                    open={props.open}
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty>
    );
}

// const testSuccessHash = "0xe128fde5c2c6601c18747ef60d688149cf6ec980290121f2fa96f7a627b06f83";

const Content = (props: Props) => {
    const { account, tokens: appTokens } = useEscher();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const queryPool = useUniswapPool({
        address: account.evm?.address as `0x${string}` | undefined,
        pool: props.pool,
        publicClient: publicClient,
    });

    const { removePosition, statusPrepare, statusOperation } =
        useUniswapRemoveLiquidity();

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();
    const [successTxHash, setSuccessTxHash] = useState<string>();

    const [fPercentage, setFPercentage] = useState("50");

    const tokens = useMemo(
        () => ({
            a: appTokens.find((t) => t.id === props.pool.tokenA.id),
            b: appTokens.find((t) => t.id === props.pool.tokenB.id),
        }),
        [appTokens, props.pool.tokenA.id, props.pool.tokenB.id],
    );

    const submit = async () => {
        if (
            !queryPool.position ||
            !queryPool.pool ||
            !account.evm?.address ||
            !publicClient ||
            !walletClient
        ) {
            return;
        }

        setIsPending(true);
        try {
            const hash = await removePosition({
                pool: props.pool,
                position: queryPool.position,
                removePercentage: new Percent(Number(fPercentage), 100),
                uniswapPool: queryPool.pool,
                publicClient,
                walletClient,
            });
            setSuccessTxHash(hash);
        } catch (error) {
            setError(getErrorMessage(String(error))?.join(". "));
        }
        setIsPending(false);
    };

    const result = useMemo(() => {
        return {
            tokenA: formatDecimal(
                Number(queryPool.position?.amount0) *
                (Number(fPercentage) / 100),
                -(tokens.a?.decimals ?? 0),
            ),
            tokenB: formatDecimal(
                Number(queryPool.position?.amount1) *
                (Number(fPercentage) / 100),
                -(tokens.b?.decimals ?? 0),
            ),
        };
    }, [fPercentage, queryPool.position?.amount0, queryPool.position?.amount1, tokens.a?.decimals, tokens.b?.decimals]);

    const buttonStatus = useMemo((): { active: boolean; text: string } => {
        if (!queryPool.position) {
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

        if (
            queryPool.position.amount0 === BigInt(0) ||
            queryPool.position.amount1 === BigInt(0)
        ) return {
            active: false,
            text: "Insufficient balance",
        }

        return {
            active: true,
            text: "Remove liquidity",
        };
    }, [isPending, queryPool.position]);

    const inRange = useMemo(() =>
        queryPool.position?.isInRange,
        // false,
        [queryPool.position?.isInRange]
    );

    useEffect(() => {
        if (inRange === false) {
            setFPercentage("100");
        }
    }, [inRange]);

    if (successTxHash) {
        return (
            <Success
                fTokenAAmount={formatNumber(result.tokenA, true, 4)}
                fTokenBAmount={formatNumber(result.tokenB, true, 4)}
                pool={props.pool}
                hash={successTxHash}
                setOpen={props.setOpen}
            />
        );
    }

    if (isPending && tokens.a && tokens.b) {
        return (
            <Progress
                defi={props.defi}
                statusOperation={statusOperation}
                statusPrepare={statusPrepare}
                tokenA={tokens.a}
                tokenB={tokens.b}
            />
        );
    }

    return (
        <div className="min-w-[585px] flex flex-col bg-white dark:bg-escher-darkblue rounded-lg">
            <div className="flex justify-between items-center bg-linear-to-r from-[#FFDDF5] to-transparent rounded-t-lg p-6">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div
                        className="text-escher-black text-xl font-bold"
                        onClick={() => console.log({ tokens })}
                    >
                        Remove Liquidity
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
            <div className="flex flex-col p-6">
                {/* Balance */}
                <div className="flex flex-col gap-2 p-4 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg">
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
                    {inRange === false &&
                        <div className="flex flex-col gap-2">
                            <div className="font-medium text-sm text-gray-700 dark:text-gray-400">
                                Your position is out of range, please withdraw and redeposit to update your price band.
                            </div>
                        </div>
                    }
                </div>

                <div className="mt-4 text-escher-777e90 text-sm">
                    Available Staked Deposit
                </div>
                <div className="grid grid-cols-2 gap-2 text-escher-black dark:text-white mt-2">
                    <TokenBalance
                        amount={formatDecimal(
                            Number(queryPool.position?.amount0 ?? 0),
                            -props.pool.tokenA.decimals,
                        )}
                        token={props.pool.tokenA}
                    />

                    <TokenBalance
                        amount={formatDecimal(
                            Number(queryPool.position?.amount1 ?? 0),
                            -props.pool.tokenB.decimals,
                        )}
                        token={props.pool.tokenB}
                    />
                </div>

                {/* FORM */}
                <div className="mt-4 text-escher-777e90 text-sm">
                    Remove Liquidity
                </div>
                <div className="flex items-center self-start w-[110px] text-xl bg-escher-f5f5ff dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-full px-3 py-2 mt-2">
                    <div className="flex-1">
                        <input
                            type="number"
                            placeholder="0"
                            value={fPercentage}
                            disabled={(inRange === false)}
                            onChange={(e) => {
                                setFPercentage(e.target.value);
                            }}
                            onFocus={(e) => e.target.select()}
                            className={clsx(
                                "w-full font-semibold bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden outline-none focus:ring-0 focus:border-transparent",
                                inRange ? "text-escher-black dark:text-white" : "text-gray-500"
                            )}
                        />
                    </div>
                    <div className="text-escher-electricblue dark:text-white opacity-20 font-bold border-l-2 border-escher-electricblue border-opacity-50 pl-2">
                        %
                    </div>
                </div>
                <Slider
                    defaultValue={[Number(fPercentage)]}
                    value={[Number(fPercentage)]}
                    disabled={(inRange === false)}
                    onValueChange={(v) => setFPercentage(v[0].toFixed(0))}
                    max={100}
                    step={1}
                    className="mt-4"
                />
                <div className="flex items-center justify-between mt-3 text-escher-777e90 text-sm">
                    <div>0%</div>
                    <div>25%</div>
                    <div>50%</div>
                    <div>75%</div>
                    <div>100%</div>
                </div>

                {/* RESULT */}
                <div className="grid grid-cols-2 gap-2 text-escher-777e90 mt-8">
                    <TokenBalance
                        amount={result.tokenA}
                        token={props.pool.tokenA}
                    />
                    <TokenBalance
                        amount={result.tokenB}
                        token={props.pool.tokenB}
                    />
                </div>

                {error && (
                    <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2 mt-8">
                        <Icon type="FaExclamationTriangle" />
                        <div>{getErrorMessage(error)}</div>
                    </div>
                )}

                <Button
                    onClick={submit}
                    title={buttonStatus.text}
                    enabled={buttonStatus.active}
                    className="mt-8"
                />

                <div className="text-sm text-escher-777e90 mt-2 text-center">
                    LP interaction executed via{" "}
                    <Link
                        href={"https://app.tower.fi/pools"}
                        className="text-escher-electricblue dark:text-white"
                        target="_blank"
                    >
                        Tower
                    </Link>{" "}
                    DEX, a third-party service provider.
                </div>
            </div>
        </div>
    );
};

const TokenBalance = (props: { amount: number; token: CustomToken }) => {
    return (
        <div className="flex flex-col gap-2 p-2 dark:bg-escher-dark_0c203d border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg">
            <div className="flex items-center gap-2">
                {props.token.icon && (
                    <Image
                        src={props.token.icon}
                        alt=""
                        width={24}
                        height={24}
                    />
                )}
                <div className="text-sm font-medium">{props.token.symbol}</div>
            </div>
            <div className="text-xl font-semibold">
                {formatNumber(props.amount, true, 4)}
            </div>
        </div>
    );
};

