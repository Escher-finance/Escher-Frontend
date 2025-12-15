import { useEscher } from "@/components/providers/escherProvider";
import { UNION_CONTRACTS, UnionContract } from "@/configs/union";
import { EMV_CHAINS } from "@/configs/wagmi";
import { sleep } from "@/lib";
import { allowance, approve } from "@/lib/evm";
import { getProxyAddressFromEvm } from "@/lib/union";
import { getWagmiConnectorClient } from "@/lib/union-sdk";
import { formatBigDecimal, JsonFromBase64 } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { ProgressStatus } from "@/types/status";
import { Batch, Call, TokenOrder, Ucs05, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import { BigDecimal, Effect, Logger, Option, pipe, Schema } from "effect";
import { useState } from "react";
import { Address, custom, http, PublicClient, WalletClient } from "viem";
import { useSwitchChain } from "wagmi";

interface UnbondParams {
    amount: string
    estimateReceive: string
    recipientAddress: string
    token: CustomToken
    tokenReceive: CustomToken
    publicClient: PublicClient
    walletClient: WalletClient
}

export const useUnionUnbond = () => {
    const { updateTimestampTransaction } = useEscher();
    const { mutateAsync: switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusApproval, setStatusApproval] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');

    const unbond = async (params: UnbondParams) => {

        let LST_CONFIG;
        switch (params.token.chain.network_type) {
            case "mainnet": LST_CONFIG = UNION_CONTRACTS.mainnet; break;
            case "testnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
            case "devnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
        }

        console.log('initiating : useUnionUnbond', { params, lst: LST_CONFIG });
        setStatusPrepare('onProgress');

        // DEBUG
        // const testSuccessHash = "0x14d2964f414bf92423c0e3a80d7be74ed7c696deb602e4d7e393108dd1c594b1";
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusApproval('success');
        // setStatusOperation('onProgress');
        // await sleep(1);
        // setStatusOperation('success');
        // return testSuccessHash;

        await switchChainAsync({ chainId: Number(params.token.chain.id) });

        try {
            if (
                !params.publicClient ||
                !params.walletClient ||
                !params.walletClient.account?.address
            ) {
                console.error({ params });
                throw "Invalid params";
            }

            const sender = params.walletClient.account?.address as Address;

            const unbondAmount = formatBigDecimal(params.amount, params.token.decimals);
            setStatusPrepare('success');

            setStatusApproval("onProgress");
            // Check allowance
            const curAllowance = await allowance({
                publicClient: params.publicClient,
                spender: LST_CONFIG.ucs03Address,
                tokenAddress: params.token.contractAddress as `0x${string}`,
                walletClient: params.walletClient
            });

            // Trigger approval token
            if (curAllowance < unbondAmount.value) {
                await approve({
                    amount: unbondAmount.value,
                    publicClient: params.publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: params.token.contractAddress as `0x${string}`,
                    walletClient: params.walletClient
                });
            }
            setStatusApproval("success");
            // ========================================================================

            setStatusOperation("onProgress");
            const result = await Effect.runPromise(zkgmUnbond({
                token: params.token,
                tokenReceive: params.tokenReceive,
                unbondAmount: unbondAmount,
                LST_CONFIG: LST_CONFIG,
                sender
            }));
            console.log({ result, json: result.toJSON() });

            const receipt = Option.getOrElse(result, () => undefined);
            const hash = receipt?.transactionHash;

            if (hash === undefined) {
                throw "Failed to get transaction receipt"
            }

            console.log('Unbond receipt', hash);
            updateTimestampTransaction();
            await sleep(5);
            setStatusOperation('success');

            return hash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const zkgmUnbond = (params: {
        LST_CONFIG: UnionContract
        unbondAmount: BigDecimal.BigDecimal
        sender: Address
        token: CustomToken
        tokenReceive: CustomToken
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
            const sender = params.sender
            const proxyAddress = yield* getProxyAddressFromEvm({
                path: BigInt(0),
                channel: params.LST_CONFIG.destinationChannelId,
                sender: sender,
                ucs03Address: params.LST_CONFIG.ucs03AddressOnUnion,
                bytecode_base_checksum: params.LST_CONFIG.bytecode_base_checksum,
                module_hash: params.LST_CONFIG.module_hash
            });

            const unbondAmount = params.unbondAmount.value;
            yield* Effect.log({ sender, proxyAddress, unbondAmount });

            const ethereumChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(params.LST_CONFIG.sendbackDestinationUniversalChainId),
            );
            const unionChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(params.LST_CONFIG.sendbackSourceUniversalChainId),
            );
            yield* Effect.log({ ethereumChain, unionChain });

            // Token order
            const tokenOrder = yield* TokenOrder.make({
                source: ethereumChain,
                destination: unionChain,
                sender: sender,
                receiver: proxyAddress,
                baseToken: params.token.contractAddress!,
                baseAmount: unbondAmount,
                quoteToken: params.LST_CONFIG.eUUnionAddress,
                quoteAmount: unbondAmount,
                kind: "solve",
                metadata: params.LST_CONFIG.EU_UNBOND_SOLVER_METADATA,
                version: 2,
            });
            yield* Effect.log({ tokenOrder });

            // Allowance
            const increaseAllowanceCall = yield* pipe(
                {
                    increase_allowance: {
                        spender: params.LST_CONFIG.lstAtUnionAddress,
                        amount: unbondAmount.toString(),
                    },
                } as const,
                Schema.encode(JsonFromBase64),
                Effect.map((msg) => ({
                    wasm: {
                        execute: {
                            contract_addr: params.LST_CONFIG.eUUnionAddress,
                            msg,
                            funds: [],
                        },
                    },
                })),
            )

            // Bond
            const unbondCall = yield* pipe(
                {
                    unbond: {
                        amount: unbondAmount.toString()
                    },
                } as const,
                Schema.encode(JsonFromBase64),
                Effect.map((msg) => ({
                    wasm: {
                        execute: {
                            contract_addr: params.LST_CONFIG.lstAtUnionAddress,
                            msg,
                            funds: [],
                        },
                    },
                })),
            )

            yield* Effect.log({
                unbondCall,
                increaseAllowanceCall,
            });

            // Calls
            const calls = yield* pipe(
                [
                    increaseAllowanceCall,
                    unbondCall,
                ],
                Schema.decode(HexFromJson),
                Effect.map((contractCalldata) =>
                    Call.make({
                        sender: Ucs05.EvmDisplay.make({
                            address: sender,
                        }),
                        eureka: false,
                        contractAddress: proxyAddress,
                        contractCalldata,
                    })
                ),
            )

            const batch = Batch.make([
                tokenOrder,
                calls
            ])

            const request = ZkgmClientRequest.make({
                source: ethereumChain,
                destination: unionChain,
                channelId: ChannelId.make(params.LST_CONFIG.channelId),
                ucs03Address: params.LST_CONFIG.ucs03Address,
                instruction: batch,
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

    return {
        unbond,
        statusOperation,
        statusPrepare,
        statusApproval
    }
}