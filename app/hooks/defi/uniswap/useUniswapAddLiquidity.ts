import { useEscher } from "@/components/providers/escherProvider";
import { sleep } from "@/lib";
import { allowanceWithApproval } from "@/lib/evm";
import { getUniTokenFromEscherToken } from "@/lib/utils";
import { DefiPool } from "@/types/defi";
import { ProgressStatus } from "@/types/status";
import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import {
    AddLiquidityOptions,
    MintOptions,
    NonfungiblePositionManager,
    Pool,
} from "@uniswap/v3-sdk";
import { useState } from "react";
import {
    Address,
    Hex,
    parseUnits,
    PublicClient,
    WalletClient,
    zeroAddress,
} from "viem";
import { useSwitchChain } from "wagmi";
import { constructPositionCustomRange } from "./useUniswapDefi";

const nonfungiblePositionManagerContractAddress =
    "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const RANGE = new Percent(25, 1000);

interface UniswapMintLiquidityParams {
    publicClient: PublicClient;
    walletClient: WalletClient;
    pool: DefiPool;
    uniswapPool: Pool;
    amountA: string;
    amountB: string;
}

interface UniswapAddLiquidityParams {
    publicClient: PublicClient;
    walletClient: WalletClient;
    pool: DefiPool;
    uniswapPool: Pool;
    amountA: string;
    amountB: string;
    positionId: string;
}

export const useUniswapAddLiquidity = () => {
    const { isSafe } = useEscher();
    const { mutateAsync: switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] =
        useState<ProgressStatus>("pending");
    const [statusApproval0, setStatusApproval0] =
        useState<ProgressStatus>("pending");
    const [statusApproval1, setStatusApproval1] =
        useState<ProgressStatus>("pending");
    const [statusOperation, setStatusOperation] =
        useState<ProgressStatus>("pending");

    const pre = async (chainId: number | string) => {
        setStatusPrepare("pending");
        setStatusApproval0("pending");
        setStatusApproval1("pending");
        setStatusOperation("pending");
        if (!isSafe) {
            await switchChainAsync({ chainId: Number(chainId) });
        }
    };

    const mintPosition = async (params: UniswapMintLiquidityParams) => {
        await pre(params.pool.tokenA.chain.id);

        try {
            if (!params.walletClient.account?.address) {
                throw `Error minting position ${params}`;
            }

            setStatusPrepare("onProgress");
            console.log("Minting position", params);

            const tokenA = getUniTokenFromEscherToken(params.pool.tokenA);
            const tokenB = getUniTokenFromEscherToken(params.pool.tokenB);

            const inputAmount = {
                a: parseUnits(params.amountA, tokenA.decimals),
                b: parseUnits(params.amountB, tokenB.decimals),
            };

            const positionToMint = constructPositionCustomRange(
                CurrencyAmount.fromRawAmount(tokenA, inputAmount.a.toString()),
                CurrencyAmount.fromRawAmount(tokenB, inputAmount.b.toString()),
                params.uniswapPool,
                RANGE,
            );

            const mintOptions: MintOptions = {
                recipient: params.walletClient.account?.address,
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
                slippageTolerance: new Percent(50, 10_000),
            };

            // get calldata for minting a position
            const { calldata } = NonfungiblePositionManager.addCallParameters(
                positionToMint,
                mintOptions,
            );
            console.log({
                tokenA,
                tokenB,
                positionToMint,
                mintOptions,
                calldata,
            });

            const aIsEth =
                tokenA.address === zeroAddress ||
                tokenA.address === wethAddress;
            const bIsEth =
                tokenB.address === zeroAddress ||
                tokenB.address === wethAddress;

            setStatusPrepare("success");

            setStatusApproval0("onProgress");
            if (!aIsEth) {
                // Check allowance token A
                const allowanceA = await allowanceWithApproval({
                    amount: inputAmount.a,
                    publicClient: params.publicClient,
                    spender: nonfungiblePositionManagerContractAddress,
                    tokenAddress: tokenA.address as Address,
                    walletClient: params.walletClient,
                });
                if (allowanceA) await sleep(5);
                else await sleep(2);
            }
            setStatusApproval0("success");

            setStatusApproval1("onProgress");
            if (!bIsEth) {
                // Check allowance token B
                const allowanceB = await allowanceWithApproval({
                    amount: inputAmount.b,
                    publicClient: params.publicClient,
                    spender: nonfungiblePositionManagerContractAddress,
                    tokenAddress: tokenB.address as Address,
                    walletClient: params.walletClient,
                });
                if (allowanceB) await sleep(5);
                else await sleep(2);
            }
            setStatusApproval1("success");

            setStatusOperation("onProgress");

            const simulateResult = await params.publicClient.call({
                to: nonfungiblePositionManagerContractAddress,
                data: calldata as Hex,
                value: aIsEth
                    ? inputAmount.a
                    : bIsEth
                        ? inputAmount.b
                        : undefined,
                account: params.walletClient.account,
            });
            console.log({ simulateResult });

            const mintPositionHash = await params.walletClient.sendTransaction({
                account: params.walletClient.account.address,
                chain: params.walletClient.chain,
                to: nonfungiblePositionManagerContractAddress,
                data: calldata as Hex,
                value: aIsEth
                    ? inputAmount.a
                    : bIsEth
                        ? inputAmount.b
                        : undefined,
            });
            const mintPositionReceipt =
                await params.publicClient.waitForTransactionReceipt({
                    hash: mintPositionHash,
                });
            console.log({ mintPositionHash, mintPositionReceipt });
            setStatusOperation("success");
            return mintPositionReceipt.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const addPosition = async (params: UniswapAddLiquidityParams) => {
        await pre(params.pool.tokenA.chain.id);

        try {
            if (
                params.positionId === "" ||
                !params.walletClient.account?.address
            ) {
                throw `Error adding position ${params}`;
            }

            setStatusPrepare("onProgress");
            console.log("Adding position", params);

            const tokenA = getUniTokenFromEscherToken(params.pool.tokenA);
            const tokenB = getUniTokenFromEscherToken(params.pool.tokenB);

            const inputAmount = {
                a: parseUnits(params.amountA, tokenA.decimals),
                b: parseUnits(params.amountB, tokenB.decimals),
            };

            const positionToAdd = constructPositionCustomRange(
                CurrencyAmount.fromRawAmount(tokenA, inputAmount.a.toString()),
                CurrencyAmount.fromRawAmount(tokenB, inputAmount.b.toString()),
                params.uniswapPool,
                RANGE,
            );

            const addLiquidityOptions: AddLiquidityOptions = {
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
                slippageTolerance: new Percent(50, 10_000),
                tokenId: params.positionId,
            };

            const { calldata } = NonfungiblePositionManager.addCallParameters(
                positionToAdd,
                addLiquidityOptions,
            );

            const aIsEth =
                tokenA.address === zeroAddress ||
                tokenA.address === wethAddress;
            const bIsEth =
                tokenB.address === zeroAddress ||
                tokenB.address === wethAddress;

            setStatusPrepare("success");

            setStatusApproval0("onProgress");
            if (!aIsEth) {
                // Check allowance token A
                const allowanceA = await allowanceWithApproval({
                    amount: inputAmount.a,
                    publicClient: params.publicClient,
                    spender: nonfungiblePositionManagerContractAddress,
                    tokenAddress: tokenA.address as Address,
                    walletClient: params.walletClient,
                });
                if (allowanceA) await sleep(5);
                else await sleep(2);
            }
            setStatusApproval0("success");

            setStatusApproval1("onProgress");
            if (!bIsEth) {
                // Check allowance token B
                const allowanceB = await allowanceWithApproval({
                    amount: inputAmount.b,
                    publicClient: params.publicClient,
                    spender: nonfungiblePositionManagerContractAddress,
                    tokenAddress: tokenB.address as Address,
                    walletClient: params.walletClient,
                });
                if (allowanceB) await sleep(5);
                else await sleep(2);
            }
            setStatusApproval1("success");

            setStatusOperation("onProgress");

            const simulateResult = await params.publicClient.call({
                to: nonfungiblePositionManagerContractAddress,
                data: calldata as Hex,
                value: aIsEth
                    ? inputAmount.a
                    : bIsEth
                        ? inputAmount.b
                        : undefined,
                account: params.walletClient.account,
            });
            console.log({ simulateResult });

            const addPositionHash = await params.walletClient.sendTransaction({
                account: params.walletClient.account.address,
                chain: params.walletClient.chain,
                to: nonfungiblePositionManagerContractAddress,
                data: calldata as Hex,
                value: aIsEth
                    ? inputAmount.a
                    : bIsEth
                        ? inputAmount.b
                        : undefined,
            });
            const addPositionReceipt =
                await params.publicClient.waitForTransactionReceipt({
                    hash: addPositionHash,
                });
            console.log({ addPositionHash, addPositionReceipt });
            setStatusOperation("success");
            return addPositionReceipt.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return {
        mintPosition,
        addPosition,
        statusPrepare,
        statusApproval0,
        statusApproval1,
        statusOperation,
    };
};
