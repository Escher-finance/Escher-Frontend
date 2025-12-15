import { getUniTokenFromEscherToken } from "@/lib/utils";
import { UniswapClaimRewardParams } from "@/types/defiUniswap";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { CollectOptions, NonfungiblePositionManager } from "@uniswap/v3-sdk";
import { useState } from "react";
import { Hex } from "viem";
import { useSwitchChain } from "wagmi";
import { nonfungiblePositionManagerContractAddress } from "./useUniswapDefi";
import { ProgressStatus } from "@/types/status";

export const useUniswapClaimReward = () => {
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

    const claimRewards = async (params: UniswapClaimRewardParams) => {
        await pre(params.pool.tokenA.chain.id);

        try {
            if (!params.walletClient.account?.address) {
                throw "Error claiming rewards";
            }
            setStatusPrepare("onProgress");
            const tokenA = getUniTokenFromEscherToken(params.pool.tokenA);
            const tokenB = getUniTokenFromEscherToken(params.pool.tokenB);

            const collectOptions: CollectOptions = {
                tokenId: params.position.tokenId.toString(),
                expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
                    tokenA,
                    params.position.tokensOwed0.toString(),
                ),
                expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
                    tokenB,
                    params.position.tokensOwed1.toString(),
                ),
                recipient: params.address,
            };

            const { calldata } =
                NonfungiblePositionManager.collectCallParameters(
                    collectOptions,
                );

            setStatusPrepare("success");

            setStatusOperation("onProgress");
            const claimRewardsHash = await params.walletClient.sendTransaction({
                account: params.walletClient.account.address,
                chain: params.walletClient.chain,
                to: nonfungiblePositionManagerContractAddress,
                data: calldata as Hex,
            });
            const claimRewardsReceipt =
                await params.publicClient.waitForTransactionReceipt({
                    hash: claimRewardsHash,
                });
            console.log({ claimRewardsHash, claimRewardsReceipt });
            setStatusOperation("success");
            return claimRewardsReceipt.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return {
        claimRewards,
        statusPrepare,
        statusOperation,
    };
};
