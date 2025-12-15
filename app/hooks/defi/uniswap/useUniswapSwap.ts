import { useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { sleep } from "@/lib";
import { allowance, approve } from "@/lib/evm";
import { formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { ProgressStatus } from "@/types/status";
import { SwapRoute } from "@uniswap/smart-order-router";
import { useState } from "react";
import { PublicClient, WalletClient } from "viem";
import { useSwitchChain } from "wagmi";

interface SwapParams {
    amount: string
    tokenIn: CustomToken
    tokenOut: CustomToken
    publicClient: PublicClient
    walletClient: WalletClient
    route: SwapRoute
}

const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

export const useUniswapSwap = () => {
    const { refetchTokens } = useEscher();
    const { mutateAsync: switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusApproval, setStatusApproval] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');

    const swap = async (params: SwapParams) => {

        console.log('initiating : useUniswapSwap:swap', { params });
        setStatusPrepare('onProgress');

        // DEBUG
        // const testSuccessHash = "0x4f4714d5c264a25f1af1c4a63e4f46e92639c9cbf4a76dafaeed19fafd12aa68"; // eU
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusOperation('onProgress');
        // await sleep(1);
        // setStatusOperation('success');
        // return testSuccessHash;

        await switchChainAsync({ chainId: Number(params.tokenIn.chain.id) });

        try {
            if (
                !params.publicClient ||
                !params.walletClient ||
                !params.walletClient.account?.address
            ) {
                console.error({ params });
                throw "Invalid params";
            }

            const amount = BigInt(formatDecimal(Number(params.amount), params.tokenIn.decimals));
            setStatusPrepare('success');

            setStatusApproval("onProgress");
            // Check allowance
            const curAllowance = await allowance({
                publicClient: params.publicClient,
                spender: V3_SWAP_ROUTER_ADDRESS,
                tokenAddress: params.tokenIn.contractAddress as `0x${string}`,
                walletClient: params.walletClient
            });

            // Trigger approval token
            if (curAllowance < amount) {
                await approve({
                    amount: amount,
                    publicClient: params.publicClient,
                    spender: V3_SWAP_ROUTER_ADDRESS,
                    tokenAddress: params.tokenIn.contractAddress as `0x${string}`,
                    walletClient: params.walletClient
                });
            }
            setStatusApproval("success");
            // ========================================================================

            setStatusOperation("onProgress");

            const simulateResult = await params.publicClient.call({
                to: params.route.methodParameters?.to as `0x${string}`,
                data: params.route.methodParameters?.calldata as `0x${string}`,
                value: BigInt(params.route.methodParameters?.value ?? "0"),
                account: params.walletClient.account
            })

            const swapHash = await params.walletClient.sendTransaction({
                account: params.walletClient.account,
                chain: params.walletClient.chain,
                to: params.route.methodParameters?.to as `0x${string}`,
                data: params.route.methodParameters?.calldata as `0x${string}`,
                value: BigInt(params.route.methodParameters?.value ?? "0"),
            });

            const receipt = await params.publicClient.waitForTransactionReceipt({ hash: swapHash, timeout: APP_CONFIG.receiptTimeout });

            console.log({
                simulateResult,
                swapHash,
                receipt
            });

            refetchTokens();
            await sleep(5);
            setStatusOperation("success");
            return receipt.transactionHash;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    return {
        swap,
        statusPrepare,
        statusApproval,
        statusOperation
    }
}