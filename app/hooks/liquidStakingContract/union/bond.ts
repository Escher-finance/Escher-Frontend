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
import { Batch, Call, Token, TokenOrder, Ucs03, Ucs05, Utils, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import { BigDecimal, Effect, Logger, Option, pipe, Schema } from "effect";
import { useState } from "react";
import { Address, custom, http, PublicClient, WalletClient } from "viem";
import { useSwitchChain } from "wagmi";
import { getUnionExchangeRate } from "./rate";

interface BondParams {
    amount: string
    estimateReceive: string
    recipientAddress: string
    token: CustomToken
    tokenReceive: CustomToken
    publicClient: PublicClient
    walletClient: WalletClient
}

export const useUnionBond = () => {
    const { updateTimestampTransaction } = useEscher();
    const { mutateAsync: switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusApproval, setStatusApproval] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');

    const bond = async (params: BondParams) => {

        let LST_CONFIG;
        switch (params.token.chain.network_type) {
            case "mainnet": LST_CONFIG = UNION_CONTRACTS.mainnet; break;
            case "testnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
            case "devnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
        }

        console.log('initiating : useUnionBond', { params, lst: LST_CONFIG });
        setStatusPrepare('onProgress');

        // DEBUG
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusApproval('success');
        // setStatusOperation('onProgress');
        // await sleep(1);
        // setStatusOperation('success');
        // const testSuccessHash = "0x2f2531db3859238ea55ae79dc800a1ff7d6299836afd4e46b2956a63a06a3219"; // mainnet
        // const testSuccessHash = "0x8d3296caba0733a724c4d099c5c1b4ed7494a1dfc301a13e26c4563316db4ed7"; // testnet
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
            const bondAmount = formatBigDecimal(params.amount, params.token.decimals);
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
            if (curAllowance < bondAmount.value) {
                await approve({
                    amount: bondAmount.value,
                    publicClient: params.publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: params.token.contractAddress as `0x${string}`,
                    walletClient: params.walletClient
                });
            }
            setStatusApproval("success");
            // ========================================================================

            setStatusOperation("onProgress");

            const result = await Effect.runPromise(zkgmBond({
                token: params.token,
                tokenReceive: params.tokenReceive,
                bondAmount: bondAmount,
                LST_CONFIG: LST_CONFIG,
                sender
            }));
            console.log({ result });

            const receipt = Option.getOrElse(result, () => undefined);
            const hash = receipt?.transactionHash;

            if (hash === undefined) {
                throw "Failed to get transaction receipt"
            }

            console.log('Bond receipt', hash);
            updateTimestampTransaction();
            await sleep(5);
            setStatusOperation('success');

            return hash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const zkgmBond = (params: {
        LST_CONFIG: UnionContract
        bondAmount: BigDecimal.BigDecimal
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
            const sender = params.sender;
            const proxyAddress = yield* getProxyAddressFromEvm({
                path: BigInt(0),
                channel: params.LST_CONFIG.destinationChannelId,
                sender: sender,
                ucs03Address: params.LST_CONFIG.ucs03AddressOnUnion,
                bytecode_base_checksum: params.LST_CONFIG.bytecode_base_checksum,
                module_hash: params.LST_CONFIG.module_hash
            });

            const rate = yield* Effect.promise(() => getUnionExchangeRate({ isTestnet: params.token.chain.network_type !== "mainnet" }));
            const bondAmount = params.bondAmount.value;
            const minAmount = params.bondAmount.pipe(
                BigDecimal.multiply(
                    BigDecimal.unsafeFromString(rate.purchase_rate).pipe(
                        BigDecimal.scale(params.token.decimals)
                    )
                ),
                BigDecimal.multiply(
                    BigDecimal.unsafeFromNumber(1 - params.LST_CONFIG.slippage)
                ),
                BigDecimal.scale(params.token.decimals),
            ).value;

            yield* Effect.log({ sender, proxyAddress, bondAmount, minAmount, rate });

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
                baseAmount: bondAmount,
                quoteToken: params.LST_CONFIG.uUnionAddress,
                quoteAmount: bondAmount,
                kind: "solve",
                metadata: params.LST_CONFIG.U_SOLVER_ON_UNION_METADATA,
                version: 2,
            });
            yield* Effect.log({ tokenOrder });

            // Bond
            const bondCall = yield* pipe(
                {
                    bond: {
                        mint_to_address: proxyAddress.address,
                        min_mint_amount: minAmount.toString(),
                    },
                } as const,
                Schema.encode(JsonFromBase64),
                Effect.map((msg) => ({
                    wasm: {
                        execute: {
                            contract_addr: params.LST_CONFIG.lstAtUnionAddress,
                            msg,
                            funds: [
                                { denom: params.LST_CONFIG.uUnionAddress, amount: bondAmount.toString() },
                            ],
                        },
                    },
                })),
            )

            // Allowance
            const increaseAllowanceCall = yield* pipe(
                {
                    increase_allowance: {
                        spender: params.LST_CONFIG.ucs03MinterOnUnionAddress,
                        amount: minAmount.toString(),
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

            // Sendback
            const salt = yield* Utils.generateSalt("cosmos")
            const timeout_timestamp = Utils.getTimeoutInNanoseconds24HoursFromNow().toString()

            const sendCall = yield* pipe(
                TokenOrder.make({
                    source: unionChain,
                    destination: ethereumChain,
                    sender: proxyAddress,
                    receiver: sender,
                    baseToken: Token.Cw20.make({ address: params.LST_CONFIG.eUUnionAddress }),
                    baseAmount: minAmount,
                    quoteToken: params.tokenReceive.contractAddress,
                    quoteAmount: minAmount,
                    kind: "solve",
                    metadata: params.LST_CONFIG.EU_FROM_UNION_SOLVER_METADATA,
                    version: 2,
                }),
                Effect.flatMap(TokenOrder.encodeV2),
                Effect.flatMap(Schema.encode(Ucs03.Ucs03WithInstructionFromHex)),
                Effect.tap((instr) => Effect.log("instruction:", instr)),
                Effect.map((instruction) => ({
                    send: {
                        channel_id: params.LST_CONFIG.destinationChannelId,
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
                            contract_addr: params.LST_CONFIG.ucs03AddressOnUnion,
                            msg,
                            funds: [],
                        },
                    },
                })),
            )

            yield* Effect.log({
                bondCall,
                increaseAllowanceCall,
                sendCall,
            });

            // Calls
            const calls = yield* pipe(
                [
                    bondCall,
                    increaseAllowanceCall,
                    sendCall,
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
        bond,
        statusOperation,
        statusPrepare,
        statusApproval
    }
}