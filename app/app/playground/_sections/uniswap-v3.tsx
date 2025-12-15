import Button from "@/components/global/button";
import Card from "@/components/global/card";
import { useEscher } from "@/components/providers/escherProvider";
import { useUniswapAddLiquidity } from "@/hooks/defi/uniswap/useUniswapAddLiquidity";
import { useUniswapClaimReward } from "@/hooks/defi/uniswap/useUniswapClaimReward";
import {
    getUniswapPool,
    getUniswapPosition,
    useUniswapPool,
} from "@/hooks/defi/uniswap/useUniswapDefi";
import { useUniswapReAddLiquidity } from "@/hooks/defi/uniswap/useUniswapReAddLiquidity";
import { useUniswapRemoveLiquidity } from "@/hooks/defi/uniswap/useUniswapRemoveLiquidity";
import { useUniswapSwap } from "@/hooks/defi/uniswap/useUniswapSwap";
import { useUniswapRoute } from "@/hooks/useUniswap";
import { DefiPool } from "@/types/defi";
import { UniswapPosition } from "@/types/defiUniswap";
import { Percent } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

export const UniswapV3 = () => {
    const { escherTokens, account } = useEscher();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { swap } = useUniswapSwap();
    const { mintPosition } = useUniswapAddLiquidity();
    const { removePosition } = useUniswapRemoveLiquidity();
    const { reAddPosition } = useUniswapReAddLiquidity();
    const { claimRewards } = useUniswapClaimReward();

    const [position, setPosition] = useState<UniswapPosition | undefined>();
    const [isLoadingPosition, setIsLoadingPosition] = useState(false);

    const pool: DefiPool = {
        claimable: true,
        hasPriceRatio: true,
        multiplier: [
            {
                text: "2.5x",
                logoUri: "/images/apps/app-escher-circle.svg",
            },
        ],
        poolAddress: "0xc58e9e692352cccba57c66a3585a2384754dc5d6",
        fee: FeeAmount.MEDIUM,
        title: "U / eU",
        tokenA: escherTokens.evm.u,
        tokenB: escherTokens.evm.eU,
        type: "",
        lst: "union",
    };

    const queryPool = useUniswapPool({
        address: walletClient?.account.address,
        pool,
        publicClient,
    });

    const amount = "0.1";

    const selectedTokens = useMemo(
        () => ({
            input: escherTokens.evm.eU,
            output: escherTokens.evm.u,
        }),
        [escherTokens],
    );

    // Uniswap route
    const autoSlippage = "5.5";
    const uniswapRoute = useUniswapRoute({
        userAddress: account.evm?.address as `0x${string}` | undefined,
        inputToken: selectedTokens.input,
        outputToken: selectedTokens.output,
        amount: amount,
        slippage: autoSlippage,
        forceSwap: true,
    });

    const quote = useMemo(() => {
        return uniswapRoute.data
            ? uniswapRoute.data.quote.toExact()
            : undefined;
    }, [uniswapRoute.data]);

    const outputAmount = useMemo(() => {
        const baseAmount = quote;
        if (!baseAmount) return undefined;

        const numericAmount = Number(baseAmount);
        return numericAmount
            .toFixed(selectedTokens.output.decimals)
            .replace(/\.?0+$/, "");
    }, [quote]);

    const submitSwap = async () => {
        if (!publicClient || !walletClient || !uniswapRoute.data) {
            throw "invalid data";
        }

        swap({
            amount: amount,
            publicClient: publicClient,
            walletClient: walletClient,
            route: uniswapRoute.data,
            tokenIn: selectedTokens.input,
            tokenOut: selectedTokens.output,
        });
    };

    const submitMint = async () => {
        if (
            !publicClient ||
            !walletClient ||
            !queryPool.pool ||
            !outputAmount
        ) {
            throw "invalid data";
        }

        mintPosition({
            walletClient,
            publicClient,
            amountA: outputAmount,
            amountB: amount,
            pool,
            uniswapPool: queryPool.pool,
        });
    };

    const submitRemove = async () => {
        if (
            !publicClient ||
            !walletClient ||
            !queryPool.pool ||
            !queryPool.position
        ) {
            throw "invalid data";
        }

        removePosition({
            walletClient,
            publicClient,
            pool,
            uniswapPool: queryPool.pool,
            position: queryPool.position,
            removePercentage: new Percent(1, 1),
        });
    };

    const submitReAdd = async () => {
        if (
            !publicClient ||
            !walletClient ||
            !queryPool.pool ||
            !queryPool.position
        ) {
            throw "invalid data";
        }

        reAddPosition({
            walletClient,
            publicClient,
            pool,
            uniswapPool: queryPool.pool,
            position: queryPool.position,
        });
    };

    const submitClaim = async () => {
        if (
            !publicClient ||
            !walletClient ||
            !queryPool.pool ||
            !queryPool.position ||
            !account.evm?.address
        ) {
            throw "invalid data";
        }

        claimRewards({
            walletClient,
            publicClient,
            pool,
            address: account.evm.address as Address,
            position: queryPool.position,
        });
    };

    const test = async () => {
        const addresses = [
            "0xff4a9aaac97c17c9e71a87678e5fff1e2262dfc1", // from indexer, works
            "0xc96f3ca6b59af9ddc8f291bbcb337325e3e716cc", // from indexer, undefined
            "0x4aaa51a0814d91f7d2b3ab60829a921ec9eb8e17", // irfandi address, works
            "0x1285a2214319eff512c5035933ac44e573738772", // nuno address, works
            "0x50ce06ab2404c72fbd57620ea8aa0e282065a831", // from indexer, works
        ] as const;

        const poolRes = await getUniswapPool({
            publicClient: publicClient,
            pool,
        });

        const positions = await Promise.all(
            addresses.map((address) =>
                getUniswapPosition({
                    publicClient: publicClient,
                    address,
                    pool: poolRes?.pool,
                    poolAddress: pool.poolAddress as Address,
                }),
            ),
        );
        console.table(positions);
    };

    useEffect(() => {
        (async () => {
            setIsLoadingPosition(true);
            try {
                const p = await getUniswapPosition({
                    publicClient,
                    address: account.evm?.address as Address | undefined,
                    pool: queryPool.pool,
                    poolAddress: pool.poolAddress as Address,
                });
                setPosition(p);
            } catch (error) {
                console.error(error);
            }
            setIsLoadingPosition(false);
        })();
    }, [publicClient, account.evm?.address, queryPool.pool, pool.poolAddress]);

    return (
        <Card className="items-start gap-0 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">
                    Uniswap V3
                </div>
                <div>Chain: {publicClient?.chain.name}</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <div className="flex flex-col gap-2">
                <div>
                    {amount} {selectedTokens.input.symbol}
                </div>
                <div>
                    {outputAmount ?? "-"} {selectedTokens.output.symbol}
                </div>
                <div>
                    Current U/eU position:{" "}
                    {isLoadingPosition
                        ? "Loading..."
                        : position
                          ? `liq ${position.liquidity} (tokenID ${position.tokenId}, ${position.isInRange ? "in range" : "out of range"})`
                          : "No position"}
                </div>
                {position && (
                    <div>
                        Pending rewards:
                        <div>
                            {position.tokensOwed0.toString()}{" "}
                            {pool.tokenA.symbol}
                        </div>
                        <div>
                            {position.tokensOwed1.toString()}{" "}
                            {pool.tokenB.symbol}
                        </div>
                    </div>
                )}
                <Button onClick={submitSwap} title="Swap eU for U" />
                <Button onClick={submitMint} title="Mint U/eU position" />
                <Button onClick={submitRemove} title="Remove position (100%)" />
                <Button
                    onClick={submitReAdd}
                    title="Re-add position (use when out of range)"
                />
                <Button onClick={submitClaim} title="Claim position rewards" />
                <Button onClick={test} title="test console.log positions" />
            </div>
        </Card>
    );
};
