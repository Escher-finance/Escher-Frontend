import { getUniTokenFromEscherToken } from "@/lib/utils";
import { DefiPool } from "@/types/defi";
import { UniswapPosition } from "@/types/defiUniswap";
import { ProgressStatus } from "@/types/status";
import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import {
    NonfungiblePositionManager,
    Pool,
    Position,
    RemoveLiquidityOptions,
} from "@uniswap/v3-sdk";
import { useState } from "react";
import { Hex, PublicClient, WalletClient } from "viem";
import { useSwitchChain } from "wagmi";
import { nonfungiblePositionManagerContractAddress } from "./useUniswapDefi";

interface UniswapRemoveLiquidityParams {
    publicClient: PublicClient;
    walletClient: WalletClient;
    pool: DefiPool;
    uniswapPool: Pool;
    position: UniswapPosition;
    removePercentage: Percent;
}

export const UNISWAP_V3_REMOVE_SLIPPAGE = new Percent(50, 10_000);

export const useUniswapRemoveLiquidity = () => {
    const { mutateAsync: switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] =
        useState<ProgressStatus>("pending");
    const [statusOperation, setStatusOperation] =
        useState<ProgressStatus>("pending");

    const pre = async (chainId: number | string) => {
        setStatusPrepare("pending");
        setStatusOperation("pending");
        await switchChainAsync({ chainId: Number(chainId) });
    };

    const removePosition = async (params: UniswapRemoveLiquidityParams) => {
        await pre(params.pool.tokenA.chain.id);

        try {
            if (!params.walletClient.account?.address) {
                throw `Error removing position ${params}`;
            }

            setStatusPrepare("onProgress");
            console.log("Removing position", params);

            const tokenA = getUniTokenFromEscherToken(params.pool.tokenA);
            const tokenB = getUniTokenFromEscherToken(params.pool.tokenB);

            const positionToRemove = new Position({
                pool: params.uniswapPool,
                liquidity: params.position.liquidity.toString(),
                tickLower: params.position.tickLower,
                tickUpper: params.position.tickUpper,
            });

            const removeLiquidityOptions: RemoveLiquidityOptions = {
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
                slippageTolerance: UNISWAP_V3_REMOVE_SLIPPAGE,
                tokenId: params.position.tokenId.toString(),
                liquidityPercentage: params.removePercentage,
                collectOptions: {
                    expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
                        tokenA,
                        params.position.tokensOwed0.toString(),
                    ),
                    expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
                        tokenB,
                        params.position.tokensOwed1.toString(),
                    ),
                    recipient: params.walletClient.account.address,
                },
            };

            const { calldata } =
                NonfungiblePositionManager.removeCallParameters(
                    positionToRemove,
                    removeLiquidityOptions,
                );

            setStatusPrepare("success");

            setStatusOperation("onProgress");
            const removePositionHash =
                await params.walletClient.sendTransaction({
                    account: params.walletClient.account.address,
                    chain: params.walletClient.chain,
                    to: nonfungiblePositionManagerContractAddress,
                    data: calldata as Hex,
                });
            const removePositionReceipt =
                await params.publicClient.waitForTransactionReceipt({
                    hash: removePositionHash,
                });
            console.log({ removePositionHash, removePositionReceipt });
            setStatusOperation("success");
            return removePositionReceipt.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return {
        removePosition,
        statusPrepare,
        statusOperation,
    };
};
