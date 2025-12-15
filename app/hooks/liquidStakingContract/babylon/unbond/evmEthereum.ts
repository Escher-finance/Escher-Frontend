import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { EMV_CHAINS } from "@/configs/wagmi";
import { getIbcChannelId } from "@/lib/cosmos";
import { CHANNEL_ID, UNIVERSAL_CHAIN_IDS } from "@/lib/ucs03";
import { getProxyAddressFromEvm } from "@/lib/union";
import { getWagmiConnectorClient } from "@/lib/union-sdk";
import { JsonFromBase64 } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Batch, Call, TokenOrder, Ucs05, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import { BigDecimal, Effect, Logger, pipe, Schema } from "effect";
import { Address, custom, http } from "viem";

export const zkgmUnbond = (params: {
    amount: BigDecimal.BigDecimal
    receiver: string
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

    // channel Id for sending from source to lst
    const channelIdSend = CHANNEL_ID.get(params.token.chain.id)?.get(CHAINS.babylon.id);
    if (!channelIdSend) throw "Unknown send channel id";

    return yield* Effect.gen(function* () {
        const sender = params.sender;
        const proxyAddress = yield* getProxyAddressFromEvm({
            path: BigInt(0),
            channel: ChannelId.make(channelIdSend.destination),
            sender: sender,
            ucs03Address: BABYLON_CONTRACTS.ucs3Contract.babylon as `${string}1${string}`,
            bytecode_base_checksum: UNION_CONTRACTS.mainnet.bytecode_base_checksum,
            module_hash: UNION_CONTRACTS.mainnet.module_hash,
            prefix: "bbn"
        });

        const amount = params.amount.value;

        yield* Effect.log({ sender, proxyAddress, bondAmount: amount });

        const sourceChainId = UNIVERSAL_CHAIN_IDS.get(params.token.chain.id);
        const lstChainId = UNIVERSAL_CHAIN_IDS.get(CHAINS.babylon.id);
        const destinationChainId = UNIVERSAL_CHAIN_IDS.get(params.tokenReceive.chain.id);
        if (!sourceChainId || !lstChainId || !destinationChainId) throw "Unknown universal chain Id";

        const sourceChain = yield* ChainRegistry.byUniversalId(
            UniversalChainId.make(sourceChainId),
        );
        const lstChain = yield* ChainRegistry.byUniversalId(
            UniversalChainId.make(lstChainId),
        );
        const destinationChain = yield* ChainRegistry.byUniversalId(
            UniversalChainId.make(destinationChainId),
        );
        yield* Effect.log({ sourceChain, lstChain, destinationChain });

        // Send token to proxy, which is babylon
        // Token order
        const tokenOrder = yield* TokenOrder.make({
            source: sourceChain,
            destination: lstChain,
            sender: sender,
            receiver: proxyAddress,
            baseToken: params.token.contractAddress!,
            baseAmount: amount,
            quoteToken: BABYLON_CONTRACTS.liquidTokenAddress.babylon,
            quoteAmount: amount,
            kind: "unescrow",
            metadata: undefined,
            version: 2,
        });
        yield* Effect.log({ tokenOrder });

        // Allowance to spend Baby
        const increaseAllowanceCall = yield* pipe(
            {
                increase_allowance: {
                    spender: BABYLON_CONTRACTS.lst,
                    amount: amount.toString(),
                },
            } as const,
            Schema.encode(JsonFromBase64),
            Effect.map((msg) => ({
                wasm: {
                    execute: {
                        contract_addr: BABYLON_CONTRACTS.liquidTokenAddress.babylon,
                        msg,
                        funds: [],
                    },
                },
            })),
        )

        // Unbond payload
        let recipient: unknown;
        switch (params.tokenReceive.chain.network) {
            case "evm": {
                // get channel from LST to destination
                const channelIdRecv = CHANNEL_ID.get(CHAINS.babylon.id)?.get(params.tokenReceive.chain.id);
                recipient = {
                    zkgm: {
                        address: params.receiver,
                        channel_id: channelIdRecv?.source ?? null,
                    },
                } as const
                break;
            }
            case "cosmos": {
                // if destination is same as LST (babylon)
                if (params.tokenReceive.chain.id === CHAINS.babylon.id) {
                    recipient = {
                        on_chain: {
                            address: params.receiver
                        }
                    } as const
                } else {
                    // get ibc channel from LST to destination
                    const ibcChannel = getIbcChannelId(CHAINS.babylon.id, params.tokenReceive.chain.id);
                    recipient = {
                        ibc: {
                            address: params.receiver,
                            ibc_channel_id: ibcChannel.source
                        }
                    } as const
                }
                break;
            }
        }

        const unbondCall = yield* pipe(
            {
                unbond: {
                    amount: amount.toString(),
                    recipient,
                },
            } as const,
            Schema.encode(JsonFromBase64),
            Effect.map((msg) => ({
                wasm: {
                    execute: {
                        contract_addr: BABYLON_CONTRACTS.lst,
                        msg,
                        funds: [],
                    },
                },
            })),
        )

        yield* Effect.log({
            increaseAllowanceCall,
            unbondCall,
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
            source: sourceChain,
            destination: lstChain,
            channelId: ChannelId.make(channelIdSend.source),
            ucs03Address: UNION_CONTRACTS.mainnet.ucs03Address,
            instruction: batch,
        })

        yield* Effect.log({ request });

        const zkgmClient = yield* ZkgmClient.ZkgmClient
        const response: ZkgmClientResponse.ZkgmClientResponse = yield* zkgmClient.execute(request)

        yield* Effect.log("Submission Hash", response.txHash)

        const completion = yield* response.waitFor(
            ZkgmIncomingMessage.LifecycleEvent.$is("EvmTransactionReceiptComplete"),
        )

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