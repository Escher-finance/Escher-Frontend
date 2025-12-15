import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { EMV_CHAINS } from "@/configs/wagmi";
import { CHANNEL_ID, UNIVERSAL_CHAIN_IDS } from "@/lib/ucs03";
import { getProxyAddressFromEvm } from "@/lib/union";
import { getWagmiConnectorClient } from "@/lib/union-sdk";
import { JsonFromBase64 } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Batch, Call, Token, TokenOrder, Ucs03, Ucs05, Utils, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import { BigDecimal, Effect, pipe, Schema } from "effect";
import { Address, custom, http } from "viem";

export const zkgmBond = (params: {
    bondAmount: BigDecimal.BigDecimal
    expected: number
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

    const isDestinationSameAsLst = params.tokenReceive.chain.id === CHAINS.babylon.id;

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

        const bondAmount = params.bondAmount.value;
        const minAmount = BigInt(params.expected);

        console.log({ sender, proxyAddress, bondAmount, minAmount });

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
        console.log({ sourceChain, lstChain, destinationChain });

        // Send token to proxy, which is babylon
        // Token order
        const tokenOrder = yield* TokenOrder.make({
            source: sourceChain,
            destination: lstChain,
            sender: sender,
            receiver: proxyAddress,
            baseToken: params.token.contractAddress!,
            baseAmount: bondAmount,
            quoteToken: BABYLON_CONTRACTS.native,
            quoteAmount: bondAmount,
            kind: "unescrow",
            metadata: undefined,
            version: 2,
        });
        console.log({ tokenOrder });

        const batchCalls = [];

        // Bond payload
        const bondMintToAddress = isDestinationSameAsLst ? params.receiver : proxyAddress.address;
        const bondCall = yield* pipe(
            {
                bond_v2: {
                    mint_to_address: bondMintToAddress,
                    min_mint_amount: minAmount.toString(),
                },
            } as const,
            Schema.encode(JsonFromBase64),
            Effect.map((msg) => ({
                wasm: {
                    execute: {
                        contract_addr: BABYLON_CONTRACTS.lst,
                        msg,
                        funds: [
                            { denom: BABYLON_CONTRACTS.native, amount: bondAmount.toString() },
                        ],
                    },
                },
            })),
        )
        batchCalls.push(bondCall);

        if (!isDestinationSameAsLst) {
            // Allowance to spend eBaby
            const increaseAllowanceCall = yield* pipe(
                {
                    increase_allowance: {
                        spender: BABYLON_CONTRACTS.tokenMinter,
                        amount: minAmount.toString(),
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
            batchCalls.push(increaseAllowanceCall);

            // Sendback eBaby to user
            // channel Id for sending eBaby from LST to recipient
            const channelIdRecv = CHANNEL_ID.get(CHAINS.babylon.id)?.get(params.tokenReceive.chain.id);
            if (!channelIdRecv) throw "Unknown receive channel id";

            const salt = yield* Utils.generateSalt("cosmos")
            const timeout_timestamp = Utils.getTimeoutInNanoseconds24HoursFromNow().toString()
            const quoteToken = params.tokenReceive.chain.network === "evm" ? params.tokenReceive.contractAddress : params.tokenReceive.denom;
            if (!quoteToken) throw "Unknown quote token";

            const UCS03_ZKGM = Ucs05.CosmosDisplay.make({
                address: BABYLON_CONTRACTS.ucs3Contract.babylon as `${string}1${string}`,
            });

            let receiver;
            switch (params.tokenReceive.chain.network) {
                case "evm":
                    receiver = Ucs05.EvmDisplay.make({
                        address: params.receiver as Address
                    });
                    break;
                case "cosmos":
                    receiver = Ucs05.CosmosDisplay.make({
                        address: params.receiver as `${string}1${string}`
                    });
                    break;
            }

            console.log({ quoteToken, receiver });

            const sendCall = yield* pipe(
                TokenOrder.make({
                    source: lstChain,
                    destination: destinationChain,
                    sender: proxyAddress,
                    receiver,
                    baseToken: Token.Cw20.make({ address: BABYLON_CONTRACTS.liquidTokenAddress.babylon }),
                    baseAmount: minAmount,
                    quoteToken,
                    quoteAmount: minAmount,
                    kind: "escrow",
                    metadata: undefined,
                    version: 2,
                }),
                Effect.flatMap(TokenOrder.encodeV2),
                Effect.flatMap(Schema.encode(Ucs03.Ucs03WithInstructionFromHex)),
                Effect.tap((instr) => Effect.log("instruction:", instr)),
                Effect.map((instruction) => ({
                    send: {
                        channel_id: channelIdRecv.source,
                        timeout_height: BigInt(0).toString(),
                        timeout_timestamp,
                        salt,
                        instruction,
                    },
                } as const)),
                Effect.flatMap(Schema.encode(JsonFromBase64)),
                Effect.map((msg) => ({
                    wasm: {
                        execute: {
                            contract_addr: UCS03_ZKGM.address,
                            msg,
                            funds: [],
                        },
                    },
                })),
            );

            batchCalls.push(sendCall);
        }

        console.log({
            batchCalls
        });

        // Calls
        const calls = yield* pipe(
            batchCalls,
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

        console.log({ request });

        const zkgmClient = yield* ZkgmClient.ZkgmClient
        const response: ZkgmClientResponse.ZkgmClientResponse = yield* zkgmClient.execute(request)

        console.log("Submission Hash", response.txHash)

        const completion = yield* response.waitFor(
            ZkgmIncomingMessage.LifecycleEvent.$is("EvmTransactionReceiptComplete"),
        )

        console.log("Completion", completion)

        return completion
    }).pipe(
        Effect.provide(EvmZkgmClient.layerWithoutWallet),
        Effect.provide(publicClient),
        Effect.provide(walletClient),
        Effect.provide(ChainRegistry.Default),
    )
});