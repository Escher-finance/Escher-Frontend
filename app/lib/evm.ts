import { APP_CONFIG } from "@/configs/app"
import { EMV_CHAINS } from "@/configs/wagmi"
import { Chain, createPublicClient, erc20Abi, http, PublicClient, WalletClient } from "viem"
import { readContract } from "viem/actions"
import { holesky, mainnet } from "viem/chains"

interface ApproveParams {
    publicClient: PublicClient
    walletClient: WalletClient
    spender: `0x${string}`
    tokenAddress: `0x${string}`
    amount: bigint
}

export const approve = async (params: ApproveParams) => {
    try {
        const { request: approveRequest } = await params.publicClient.simulateContract({
            address: params.tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                params.spender,
                params.amount
            ],
            account: params.walletClient.account
        });
        console.log('Approve request', approveRequest);

        const approvalHash = await params.walletClient.writeContract(approveRequest);
        console.log('Approval hash', approvalHash);

        const approvalReceipt = await params.publicClient.waitForTransactionReceipt({ hash: approvalHash, timeout: APP_CONFIG.receiptTimeout });
        console.log('Approval receipt', approvalReceipt);

        return approvalReceipt.transactionHash;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

interface AllowanceParams {
    publicClient: PublicClient
    walletClient: WalletClient
    tokenAddress: `0x${string}`
    spender: `0x${string}`
}

export const allowance = async (
    params: AllowanceParams
) => {
    try {
        if (params.walletClient === undefined || params.walletClient.account?.address === undefined) {
            throw 'Wallet client undefined';
        }

        const result = await readContract(params.publicClient, {
            address: params.tokenAddress,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [
                params.walletClient.account.address,
                params.spender
            ],
        });
        console.log('Allowance', result);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const allowanceWithApproval = async (params: ApproveParams) => {
    try {
        const curAllowance = await allowance(params);
        if (curAllowance < params.amount) {
            const approvalReceipt = await approve(params);
            return approvalReceipt;
        }
        return undefined;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getPublicClient = (chain: Chain) => {
    const rpc = EMV_CHAINS.get(chain.id as typeof mainnet.id | typeof holesky.id)?.rpc;

    return createPublicClient({
        chain,
        transport: http(rpc),
    });
}