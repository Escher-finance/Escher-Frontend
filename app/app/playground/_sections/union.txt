import Button from "@/components/global/button";
import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import { useEscher } from "@/components/providers/escherProvider";
import { CHAINS } from "@/configs/chains";
import { EU_TOKENS, U_TOKENS } from "@/configs/token";
import { UNION_CONTRACTS } from "@/configs/union";
import { getUnionExchangeRate, useUnionExchangeRate } from "@/hooks/liquidStakingContract/union/rate";
import { allowance, approve } from "@/lib/evm";
import { getProxyAddressFromEvm } from "@/lib/union";
import { getWagmiConnectorClient } from "@/lib/union-sdk";
import { formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Batch, Call, Token, TokenOrder, Ucs03, Ucs05, Utils, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import BigNumber from 'bignumber.js';
import { Effect, Logger, pipe, Schema } from "effect";
import { useMemo, useState } from "react";
import { Address, custom } from "viem";
import { useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

// mainnet, holesky
const LST_CONFIG = UNION_CONTRACTS.mainnet;

const JsonFromBase64 = Schema.compose(
    Schema.StringFromBase64,
    Schema.parseJson(),
)

const Union = () => {
    const {
        account, tokens, refetchTokens
    } = useEscher();

    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const queryUnionExchangeRate = useUnionExchangeRate();

    // mainnet, holesky
    const filteredTokens = useMemo(() => ({
        native: tokens.find(t => t.id === `${CHAINS.mainnet.id}`)!,
        u: tokens.find(t => t.id === U_TOKENS.mainnet.id)!,
        eu: tokens.find(t => t.id === EU_TOKENS.mainnet.id)!,
    }), [tokens]);

    const [amount, setAmount] = useState("0");
    const [isPending, setIsPending] = useState(false);
    const [hashesTransfer, setHashesTransfer] = useState<string[]>([]);
    const [hashesBond, setHashesBond] = useState<string[]>([]);
    const [hashesUnbond, setHashesUnbond] = useState<string[]>([]);

    // Transfer
    const transfer = async () => {
        setIsPending(true);
        try {
            if (
                !publicClient ||
                !walletClient
            ) {
                console.error({
                    publicClient,
                    walletClient
                });
                throw "Invalid params";
            }
            const baseToken = filteredTokens.u.contractAddress as `0x${string}`;
            const transferAmount = BigInt(formatDecimal(Number(amount), filteredTokens.u.decimals));

            // Check allowance
            const curAllowance = await allowance({
                publicClient,
                spender: LST_CONFIG.ucs03Address,
                tokenAddress: baseToken,
                walletClient,
            });
            console.log({ curAllowance });

            // // Trigger approval token
            if (curAllowance < transferAmount) {
                await approve({
                    amount: transferAmount,
                    publicClient: publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: baseToken,
                    walletClient: walletClient
                });
            }

            const result = await Effect.runPromise(zkgmTransfer);
            console.log({ result, json: result.toJSON() });

            let hash: string | undefined;
            try {
                hash = (result as { value: { transactionHash: string } }).value.transactionHash;
                console.log({ hash });
            } catch (error) {
                console.error(error);
            }

            if (hash) {
                setHashesTransfer(prev => [...prev, hash]);
            }
        } catch (error) {
            console.error(error);
        }
        setIsPending(false);
    }

    const zkgmTransfer = Effect.gen(function* () {

        const connectorClient = yield* getWagmiConnectorClient

        const publicClient = Evm.PublicClient.Live({
            chain: connectorClient.chain,
            transport: custom(connectorClient),
        })
        const walletClient = Evm.WalletClient.Live({
            account: connectorClient.account,
            chain: connectorClient.chain,
            transport: custom(connectorClient),
        })

        return yield* Effect.gen(function* () {
            const userAddress = account.evm?.address as Address;
            const transferAmount = BigInt(formatDecimal(Number(amount), filteredTokens.u.decimals));
            yield* Effect.log({ userAddress, transferAmount });

            const source = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make("ethereum.17000"),
            );
            const destination = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make("ethereum.11155111"),
            );
            yield* Effect.log({ source, destination });

            const tokenOrder = yield* TokenOrder.make({
                source: source,
                destination: destination,
                sender: userAddress,
                receiver: userAddress,
                baseToken: filteredTokens.u.contractAddress!,
                baseAmount: transferAmount,
                quoteToken: filteredTokens.u.contractAddress!,
                quoteAmount: transferAmount,
                kind: "escrow",
                metadata: undefined,
                version: 2,
            });
            yield* Effect.log({ tokenOrder });

            const request = ZkgmClientRequest.make({
                source: source,
                destination: destination,
                channelId: ChannelId.make(2),
                ucs03Address: LST_CONFIG.ucs03Address,
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

    // Bond
    const bond = async () => {
        setIsPending(true);
        try {
            if (
                !publicClient ||
                !walletClient
            ) {
                console.error({
                    publicClient,
                    walletClient
                });
                throw "Invalid params";
            }
            const inputToken = filteredTokens.u;
            const outputToken = filteredTokens.eu;
            const baseToken = inputToken.contractAddress as `0x${string}`;
            const transferAmount = BigInt(formatDecimal(Number(amount), inputToken.decimals));

            // Check allowance
            const curAllowance = await allowance({
                publicClient,
                spender: LST_CONFIG.ucs03Address,
                tokenAddress: baseToken,
                walletClient,
            });
            console.log({ curAllowance });

            // // Trigger approval token
            if (curAllowance < transferAmount) {
                await approve({
                    amount: transferAmount,
                    publicClient: publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: baseToken,
                    walletClient: walletClient
                });
            }

            const result = await Effect.runPromise(zkgmBond({ token: inputToken, tokenReceive: outputToken }));
            console.log({ result, json: result.toJSON() });

            let hash: string | undefined;
            try {
                hash = (result as { value: { transactionHash: string } }).value.transactionHash;
                console.log({ hash });
            } catch (error) {
                console.error(error);
            }

            if (hash) {
                setHashesBond(prev => [...prev, hash]);
            }
        } catch (error) {
            console.error(error);
        }
        setIsPending(false);
    }

    const zkgmBond = (params: { token: CustomToken, tokenReceive: CustomToken }) => Effect.gen(function* () {

        const connectorClient = yield* getWagmiConnectorClient

        const publicClient = Evm.PublicClient.Live({
            chain: connectorClient.chain,
            transport: custom(connectorClient),
        })
        const walletClient = Evm.WalletClient.Live({
            account: connectorClient.account,
            chain: connectorClient.chain,
            transport: custom(connectorClient),
        })

        return yield* Effect.gen(function* () {
            const sender = account.evm?.address as Address;
            const proxyAddress = yield* getProxyAddressFromEvm({
                path: BigInt(0),
                channel: LST_CONFIG.destinationChannelId,
                sender: sender,
                ucs03Address: LST_CONFIG.ucs03AddressOnUnion,
                bytecode_base_checksum: LST_CONFIG.bytecode_base_checksum,
                module_hash: LST_CONFIG.module_hash
            });

            const bondAmount = BigInt(formatDecimal(Number(amount), params.token.decimals));

            const rate = yield* Effect.promise(() => getUnionExchangeRate({ isTestnet: params.token.chain.network_type !== "mainnet" }));
            const minAmount = BigInt(
                BigNumber(amount).times(BigNumber(rate.purchase_rate)).times(BigNumber(1 - LST_CONFIG.slippage))
                    .shiftedBy(params.token.decimals).toFixed(0)
            );
            yield* Effect.log({ sender, proxyAddress, bondAmount });

            const ethereumChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(LST_CONFIG.sendbackDestinationUniversalChainId),
            );
            const unionChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(LST_CONFIG.sendbackSourceUniversalChainId),
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
                quoteToken: LST_CONFIG.uUnionAddress,
                quoteAmount: bondAmount,
                kind: "solve",
                metadata: LST_CONFIG.U_SOLVER_ON_UNION_METADATA,
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
                            contract_addr: LST_CONFIG.lstAtUnionAddress,
                            msg,
                            funds: [
                                { denom: LST_CONFIG.uUnionAddress, amount: bondAmount.toString() },
                            ],
                        },
                    },
                })),
            )

            // Allowance
            const increaseAllowanceCall = yield* pipe(
                {
                    increase_allowance: {
                        spender: LST_CONFIG.ucs03MinterOnUnionAddress,
                        amount: minAmount.toString(),
                    },
                } as const,
                Schema.encode(JsonFromBase64),
                Effect.map((msg) => ({
                    wasm: {
                        execute: {
                            contract_addr: LST_CONFIG.eUUnionAddress,
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
                    baseToken: Token.Cw20.make({ address: LST_CONFIG.eUUnionAddress }),
                    baseAmount: minAmount,
                    quoteToken: params.tokenReceive.contractAddress,
                    quoteAmount: minAmount,
                    kind: "solve",
                    metadata: LST_CONFIG.EU_FROM_UNION_SOLVER_METADATA,
                    version: 2,
                }),
                Effect.flatMap(TokenOrder.encodeV2),
                Effect.flatMap(Schema.encode(Ucs03.Ucs03WithInstructionFromHex)),
                Effect.tap((instr) => Effect.log("instruction:", instr)),
                Effect.map((instruction) => ({
                    send: {
                        channel_id: LST_CONFIG.destinationChannelId,
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
                            contract_addr: LST_CONFIG.ucs03AddressOnUnion,
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
                channelId: ChannelId.make(LST_CONFIG.channelId),
                ucs03Address: LST_CONFIG.ucs03Address,
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

    // Unbond
    const unbond = async () => {
        setIsPending(true);
        try {
            if (
                !publicClient ||
                !walletClient
            ) {
                console.error({
                    publicClient,
                    walletClient
                });
                throw "Invalid params";
            }
            const inputToken = filteredTokens.eu;
            const outputToken = filteredTokens.u;
            const baseToken = inputToken.contractAddress as `0x${string}`;
            const transferAmount = BigInt(formatDecimal(Number(amount), inputToken.decimals));

            // Check allowance
            const curAllowance = await allowance({
                publicClient,
                spender: LST_CONFIG.ucs03Address,
                tokenAddress: baseToken,
                walletClient,
            });
            console.log({ curAllowance });

            // // Trigger approval token
            if (curAllowance < transferAmount) {
                await approve({
                    amount: transferAmount,
                    publicClient: publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: baseToken,
                    walletClient: walletClient
                });
            }

            const result = await Effect.runPromise(zkgmUnbond({ token: inputToken, tokenReceive: outputToken }));
            console.log({ result, json: result.toJSON() });

            let hash: string | undefined;
            try {
                hash = (result as { value: { transactionHash: string } }).value.transactionHash;
                console.log({ hash });
            } catch (error) {
                console.error(error);
            }

            if (hash) {
                setHashesUnbond(prev => [...prev, hash]);
            }
        } catch (error) {
            console.error(error);
        }
        setIsPending(false);
    }

    const zkgmUnbond = (params: { token: CustomToken, tokenReceive: CustomToken }) => Effect.gen(function* () {

        const connectorClient = yield* getWagmiConnectorClient

        const publicClient = Evm.PublicClient.Live({
            chain: connectorClient.chain,
            transport: custom(connectorClient),
        })
        const walletClient = Evm.WalletClient.Live({
            account: connectorClient.account,
            chain: connectorClient.chain,
            transport: custom(connectorClient),
        })

        return yield* Effect.gen(function* () {
            const sender = account.evm?.address as Address;
            const proxyAddress = yield* getProxyAddressFromEvm({
                path: BigInt(0),
                channel: LST_CONFIG.destinationChannelId,
                sender: sender,
                ucs03Address: LST_CONFIG.ucs03AddressOnUnion,
                bytecode_base_checksum: LST_CONFIG.bytecode_base_checksum,
                module_hash: LST_CONFIG.module_hash
            });

            const unbondAmount = BigInt(formatDecimal(Number(amount), params.token.decimals));
            yield* Effect.log({ sender, proxyAddress, unbondAmount });

            const ethereumChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(LST_CONFIG.sendbackDestinationUniversalChainId),
            );
            const unionChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(LST_CONFIG.sendbackSourceUniversalChainId),
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
                quoteToken: LST_CONFIG.eUUnionAddress,
                quoteAmount: unbondAmount,
                kind: "solve",
                metadata: LST_CONFIG.EU_UNBOND_SOLVER_METADATA,
                version: 2,
            });
            yield* Effect.log({ tokenOrder });

            // Allowance
            const increaseAllowanceCall = yield* pipe(
                {
                    increase_allowance: {
                        spender: LST_CONFIG.lstAtUnionAddress,
                        amount: unbondAmount.toString(),
                    },
                } as const,
                Schema.encode(JsonFromBase64),
                Effect.map((msg) => ({
                    wasm: {
                        execute: {
                            contract_addr: LST_CONFIG.eUUnionAddress,
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
                            contract_addr: LST_CONFIG.lstAtUnionAddress,
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
                channelId: ChannelId.make(LST_CONFIG.channelId),
                ucs03Address: LST_CONFIG.ucs03Address,
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

    return (
        <Card className="items-start gap-2 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Union bond</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />

            <div>Active chain ID : {chainId}</div>

            <div className="grid grid-cols-2 gap-2 p-4 border border-gray-200">
                <div className="font-bold text-gray-700">Token</div>
                <div className="flex items-center gap-1">
                    <div className="font-bold text-gray-700">Balance</div>
                    <button onClick={refetchTokens}>
                        <Icon type="IoMdRefresh" />
                    </button>
                </div>

                <div className="py-2 border-t border-gray-200">{filteredTokens.native?.name}</div>
                <div className="py-2 border-t border-gray-200">{filteredTokens.native?.balance?.formattedBalance} {filteredTokens.native?.symbol}</div>

                <div className="py-2 border-t border-gray-200">{filteredTokens.u?.name}</div>
                <div className="py-2 border-t border-gray-200">{filteredTokens.u?.balance?.formattedBalance} {filteredTokens.u?.symbol}</div>

                <div className="py-2 border-t border-gray-200">{filteredTokens.eu?.name}</div>
                <div className="py-2 border-t border-gray-200">{filteredTokens.eu?.balance?.formattedBalance ?? "0"} {filteredTokens.eu?.symbol}</div>

                <div className="py-2 border-t border-gray-200">Rate</div>
                <div className="py-2 border-t border-gray-200">1 U : {queryUnionExchangeRate.data?.purchase_rate ?? "-"}eU</div>
                <div className="py-2 border-t border-gray-200"></div>
                <div className="py-2 border-t border-gray-200">1 eU : {queryUnionExchangeRate.data?.redemption_rate ?? "-"}U</div>
            </div>

            {chainId !== filteredTokens.u?.chain.id ?
                <Button title="Switch chain" onClick={() => filteredTokens.u?.chain.id && switchChain({ chainId: Number(filteredTokens.u?.chain.id) })} />
                :
                <>
                    <div className="flex flex-col gap-2 p-4 bg-slate-300">
                        <input type="number" className="bg-white" placeholder="amount" value={amount} onChange={e => setAmount(e.target.value)} />
                        <Button title="Transfer U to sepolia" onClick={transfer} isLoading={isPending} className="bg-blue-500" />
                        <Button title="Bond U" onClick={bond} isLoading={isPending} className="bg-emerald-500" />
                        <Button title="Unbond eU" onClick={unbond} isLoading={isPending} className="bg-red-500" />
                    </div>
                </>
            }

            <div className="mt-4 flex flex-col gap-1 text-sm font-semibold">
                <div>Transfer Hashes : </div>
                {hashesTransfer.length === 0 &&
                    <div>-- no data --</div>
                }
                {hashesTransfer.map(v =>
                    <div>{v}</div>
                )}
                <hr />
                <div>Bond Hashes : </div>
                {hashesBond.length === 0 &&
                    <div>-- no data --</div>
                }
                {hashesBond.map(v =>
                    <div>{v}</div>
                )}
                <hr />
                <div>Unbond Hashes : </div>
                {hashesUnbond.length === 0 &&
                    <div>-- no data --</div>
                }
                {hashesUnbond.map(v =>
                    <div>{v}</div>
                )}
            </div>
        </Card>
    );
};

export default Union;