import { useEscher } from "@/components/providers/escherProvider";
import { UNION_CONTRACTS, UnionContract } from "@/configs/union";
import { EMV_CHAINS } from "@/configs/wagmi";
import { sleep } from "@/lib";
import { getDateNow } from "@/lib/date";
import { allowance, approve } from "@/lib/evm";
import { BRIDGE_TOKENS, CHANNEL_ID, UNIVERSAL_CHAIN_IDS } from "@/lib/ucs03";
import { getWagmiConnectorClient } from "@/lib/union-sdk";
import { formatBigDecimal, formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { TokenOrder, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { BigDecimal, Effect, Logger, Option } from "effect";
import { useState } from "react";
import { custom, http, PublicClient, WalletClient } from "viem";
import { useSwitchChain } from "wagmi";
import { useLocalTransactions } from "../local/useLocalTransactions";

interface EvmBridgeParams {
    senderAddress: string
    recipientAddress: string
    amount: string
    tokenIn: CustomToken
    tokenOut: CustomToken
    publicClient: PublicClient
    walletClient: WalletClient
}

export const useEvmBridge = () => {
    const { updateTimestampTransaction } = useEscher();
    const { switchChainAsync } = useSwitchChain();
    const { saveData } = useLocalTransactions();

    const [isPending, setIsPending] = useState(false);
    const [successHash, setSuccessHash] = useState<string>();
    const [error, setError] = useState<string>();

    const bridge = async (params: EvmBridgeParams) => {
        setIsPending(true);
        setSuccessHash(undefined);
        setError(undefined);

        let LST_CONFIG;
        switch (params.tokenIn.chain.network_type) {
            case "mainnet": LST_CONFIG = UNION_CONTRACTS.mainnet; break;
            case "testnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
            case "devnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
        }

        console.log('initiating : useEvmBridge', { params, LST_CONFIG });

        // DEBUG
        // const testSuccessHash = "0xd23ecb352573c9bb3c8bb187e660ec7b6009c0b49c20da5fe94fb0ac8a2a76c2"; // eth->baby
        // await sleep(1);
        // saveLocal(params, testSuccessHash);
        // updateTimestampTransaction();
        // setSuccessHash(testSuccessHash);
        // setIsPending(false);
        // return;

        await switchChainAsync({ chainId: Number(params.tokenIn.chain.id) })

        try {

            const bridgeToken = BRIDGE_TOKENS.get(params.tokenIn.symbol);
            if (!bridgeToken) {
                console.error({ params });
                throw "Bridge not found";
            }

            const baseToken = bridgeToken.baseToken.get(params.tokenIn.chain.id);
            const tokenOrderKind = bridgeToken.tokenOrderKind.get(params.tokenIn.chain.id);
            const channelId = CHANNEL_ID.get(params.tokenIn.chain.id)?.get(params.tokenOut.chain.id);
            const quoteToken = bridgeToken.quoteToken.get(params.tokenOut.chain.id);

            if (
                !params.publicClient ||
                !params.walletClient ||
                !params.walletClient.account?.address ||
                baseToken === undefined ||
                channelId === undefined ||
                quoteToken === undefined ||
                tokenOrderKind === undefined
            ) {
                console.error({ params });
                throw "Invalid params";
            }

            const amount = formatBigDecimal(params.amount, params.tokenIn.decimals);

            // Check allowance
            const curAllowance = await allowance({
                publicClient: params.publicClient,
                spender: LST_CONFIG.ucs03Address,
                tokenAddress: params.tokenIn.contractAddress as `0x${string}`,
                walletClient: params.walletClient
            });

            // Trigger approval token
            if (curAllowance < amount.value) {
                await approve({
                    amount: amount.value,
                    publicClient: params.publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: params.tokenIn.contractAddress as `0x${string}`,
                    walletClient: params.walletClient
                });
            }

            // Transfer
            const result = await Effect.runPromise(zkgmTransfer({
                amount,
                LST_CONFIG: LST_CONFIG,
                receiver: params.recipientAddress,
                sender: params.senderAddress,
                sourceChannelId: channelId.source,
                token: params.tokenIn,
                tokenReceive: params.tokenOut,
            }));
            console.log({ result, json: result.toJSON() });

            const receipt = Option.getOrElse(result, () => undefined);
            const hash = receipt?.transactionHash;

            if (hash === undefined) {
                throw "Failed to get transaction receipt"
            }

            console.log('Transfer receipt', hash);

            await sleep(5);
            saveLocal(params, hash);
            updateTimestampTransaction();
            setSuccessHash(hash);
            saveLocal(params, hash);
        } catch (error) {
            console.error(error);
            setError(error as string);
        }

        setIsPending(false);
    };

    const saveLocal = (params: EvmBridgeParams, hash: string) => {
        try {
            const denomA = params.tokenIn.denom ?? params.tokenIn.contractAddress;
            if (!denomA) {
                throw "Unknown denom";
            }
            saveData({
                lst: "babylon",
                action: "bridge",
                amountA: formatDecimal(Number(params.amount), params.tokenIn.decimals).toFixed(0),
                amountB: formatDecimal(Number(params.amount), params.tokenOut.decimals).toFixed(0),
                denomA,
                exchangeRate: 0,
                hash: hash,
                source: "local",
                status: "pending",
                submitted: undefined,
                time: getDateNow(),
                userAddress: params.senderAddress,
                recipient: params.recipientAddress,
                channelId: 0, // leave 0 since we are using token id
                recipientChannelId: 0, // same as above
                tokenIdA: params.tokenIn.id,
                tokenIdB: params.tokenOut.id,
            });
            console.log("Success save local");
        } catch (error) {
            console.error(error);
        }
    }

    return {
        bridge,
        successHash,
        error,
        isPending
    }
}

const zkgmTransfer = (params: {
    LST_CONFIG: UnionContract
    amount: BigDecimal.BigDecimal
    sender: string
    receiver: string
    token: CustomToken
    tokenReceive: CustomToken
    sourceChannelId: number
}) => Effect.gen(function* () {

    const connectorClient = yield* getWagmiConnectorClient

    const publicClient = Evm.PublicClient.Live({
        chain: connectorClient.chain,
        transport: http(EMV_CHAINS.get(params.token.chain.id as 1 | 17000 | 11155111)?.rpc),
    })
    const walletClient = Evm.WalletClient.Live({
        account: connectorClient.account,
        chain: connectorClient.chain,
        transport: custom(connectorClient),
    })

    return yield* Effect.gen(function* () {
        const amount = params.amount.value;

        const sourceChainId = UNIVERSAL_CHAIN_IDS.get(params.token.chain.id);
        const destinationChainId = UNIVERSAL_CHAIN_IDS.get(params.tokenReceive.chain.id);
        if (!sourceChainId || !destinationChainId) throw "Unknown universal chain Id";

        const sourceChain = yield* ChainRegistry.byUniversalId(
            UniversalChainId.make(sourceChainId),
        );
        const destinationChain = yield* ChainRegistry.byUniversalId(
            UniversalChainId.make(destinationChainId),
        );
        yield* Effect.log({ sourceChain, destinationChain });

        // Token order
        const baseToken = params.token.contractAddress ?? params.token.denom;
        const quoteToken = params.tokenReceive.contractAddress ?? params.tokenReceive.denom;
        if (!baseToken || !quoteToken) throw "Unknown token";
        const tokenOrder = yield* TokenOrder.make({
            source: sourceChain,
            destination: destinationChain,
            sender: params.sender,
            receiver: params.receiver,
            baseToken,
            baseAmount: amount,
            quoteToken,
            quoteAmount: amount,
            kind: "unescrow",
            metadata: undefined,
            version: 2,
        });
        yield* Effect.log({ tokenOrder });

        const request = ZkgmClientRequest.make({
            source: sourceChain,
            destination: destinationChain,
            channelId: ChannelId.make(params.sourceChannelId),
            ucs03Address: params.LST_CONFIG.ucs03Address,
            instruction: tokenOrder,
        })

        yield* Effect.log({ request });

        const zkgmClient = yield* ZkgmClient.ZkgmClient

        // NOTE: 1. switch chain is assumed
        // NOTE: 2. write in progress
        const response: ZkgmClientResponse.ZkgmClientResponse = yield* zkgmClient.execute(request)

        // NOTE: 3. write complete (with tx hash)
        yield* Effect.log("Submission Hash", response.txHash)

        const completion = yield* response.waitFor(
            ZkgmIncomingMessage.LifecycleEvent.$is("EvmTransactionReceiptComplete"),
        )

        // NOTE: 4. tx complete
        yield* Effect.log("Completion", completion)

        return completion
    }).pipe(
        Effect.provide(EvmZkgmClient.layerWithoutWallet),
        Effect.provide(publicClient),
        Effect.provide(walletClient),
        Effect.provide(ChainRegistry.Default),
        Effect.provide(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
    )
});

/* 
    const getTokenOrderV2Params: GetTokenOrderV2Params = {
        baseAmount: amount.value,
        baseToken: baseToken,
        metadata: toHex(""),
        quoteAmount: amount.value,
        quoteToken: quoteToken.hex,
        receiver: params.recipientAddress,
        sender: params.senderAddress,
        tokenOrderKind

    } as const;

    const tokenOrder = getTokenOrderV2(getTokenOrderV2Params);

    const salt = getSalt();
    const transferParams = {
        address: LST_CONFIG.ucs03Address,
        abi: ucs03abi,
        functionName: 'send',
        args: [
            channelId.source,
            BigInt(0),
            getTimeoutInNanoseconds7DaysFromNow(),
            salt,
            {
                opcode: tokenOrder.opcode,
                version: tokenOrder.version,
                operand: encodeTokenOrderV2(tokenOrder),
            },
        ],
        account: params.walletClient.account
    } as const;
    console.log('Transfer params', transferParams);

    const { request: transferRequest } = await params.publicClient.simulateContract(transferParams);
    console.log('Transfer request', transferRequest);

    const transferHash = await params.walletClient.writeContract(transferRequest);
    console.log('Transfer hash', transferHash);

    const transferReceipt = await params.publicClient.waitForTransactionReceipt({
        hash: transferHash,
        timeout: APP_CONFIG.receiptTimeout
    });
    console.log('Transfer receipt', transferReceipt);

    await sleep(5);
    saveLocal(params, transferReceipt.transactionHash);
    updateTimestampTransaction();
    setSuccessHash(transferReceipt.transactionHash); 
*/