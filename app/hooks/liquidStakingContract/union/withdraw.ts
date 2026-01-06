import { useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS, UnionContract } from "@/configs/union";
import { EMV_CHAINS } from "@/configs/wagmi";
import { getUnionWithdrawByAddress } from "@/hooks/unionIndexer/dust";
import { sleep } from "@/lib";
import { fetchCosmosQuery } from "@/lib/cosmos";
import { getProxyAddressFromEvm } from "@/lib/union";
import { getWagmiConnectorClient } from "@/lib/union-sdk";
import { JsonFromBase64 } from "@/lib/utils";
import { ProgressStatus } from "@/types/status";
import { UnionBatch, UnionUserUnstakes } from "@/types/union";
import { useQuery } from "@tanstack/react-query";
import { Batch, Call, Token, TokenOrder, Ucs03, Ucs05, Utils, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import { BigDecimal, Effect, Logger, Option, pipe, Schema } from "effect";
import { useState } from "react";
import { Address, custom, http } from "viem";
import { mainnet } from "viem/chains";
import { useSwitchChain } from "wagmi";

interface UnionWithdraw {
    batch_id: string;
    withdrawableAmount: bigint;
}

interface WithdrawParams {
    batches: UnionWithdraw[]
}

export const useUnionWithdraw = () => {
    const { account, updateTimestampTransaction, isSafe } = useEscher();
    const { mutateAsync: switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');

    const query = useQuery({
        queryKey: ["lst", "union", "withdraw", account.evm?.address],
        queryFn: () => getUnionWithdraw((account.evm?.address as Address | undefined)),
        enabled: !!account.evm?.address,
        refetchInterval: APP_CONFIG.refetchIntervalFast10s
    });

    const withdraw = async (params: WithdrawParams) => {
        const LST_CONFIG = UNION_CONTRACTS.mainnet;

        console.log('initiating : useUnionWithdraw:withdraw', { params, lst: LST_CONFIG });
        setStatusPrepare('onProgress');

        // DEBUG
        // const testSuccessHash = "0x3557ca997eead85208f4fd4de5f0aaab3763d37f71960bef47ed5203bba11569";
        // // const testSuccessHash = "0xfb8d0a7f0fa98003679c70248236f1a6b0834e4111ae246a54ac9a0983ef734d"; // null success
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusOperation('onProgress');
        // await sleep(1);
        // setStatusOperation('success');
        // return testSuccessHash;

        if (!isSafe) {
            await switchChainAsync({ chainId: Number(mainnet.id) });
        }

        try {
            const sender = account.evm?.address as Address | undefined;
            if (!sender) throw "Invalid account";

            setStatusPrepare('success');

            setStatusOperation("onProgress");
            const result = await Effect.runPromise(zkgmWithdraw({
                LST_CONFIG: LST_CONFIG,
                batches: params.batches,
                sender
            }));
            console.log({ result });

            const receipt = Option.getOrElse(result, () => undefined);
            const hash = receipt?.transactionHash;

            if (hash === undefined) {
                throw "Failed to get transaction receipt"
            }

            console.log('Withdraw receipt', hash);
            updateTimestampTransaction();
            await sleep(5);
            setStatusOperation('success');

            return hash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const zkgmWithdraw = (params: {
        LST_CONFIG: UnionContract
        batches: UnionWithdraw[]
        sender: Address
    }) => Effect.gen(function* () {

        const connectorClient = yield* getWagmiConnectorClient

        const publicClient = Evm.PublicClient.Live({
            chain: connectorClient.chain,
            transport: http(EMV_CHAINS.get(1)?.rpc),
        })
        const walletClient = Evm.WalletClient.Live({
            account: connectorClient.account,
            chain: connectorClient.chain,
            transport: custom(connectorClient),
        })

        return yield* Effect.gen(function* () {
            const sender = params.sender;
            const proxy = yield* getProxyAddressFromEvm({
                path: BigInt(0),
                channel: params.LST_CONFIG.destinationChannelId,
                sender: sender,
                ucs03Address: params.LST_CONFIG.ucs03AddressOnUnion,
                bytecode_base_checksum: params.LST_CONFIG.bytecode_base_checksum,
                module_hash: params.LST_CONFIG.module_hash
            });

            yield* Effect.log({ sender, proxy });

            const ethereumChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(params.LST_CONFIG.sendbackDestinationUniversalChainId),
            );
            const unionChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(params.LST_CONFIG.sendbackSourceUniversalChainId),
            );
            yield* Effect.log({ ethereumChain, unionChain });


            // Create withdraw calls for each batch
            const withdrawCalls = yield* Effect.all(
                params.batches.map(batch =>
                    pipe(
                        {
                            withdraw: {
                                withdraw_to_address: proxy.address,
                                batch_id: batch.batch_id,
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
                        } as const)),
                    )
                ),
            )

            const totalAmountBigDecimal = params.batches.reduce(
                (sum, batch) => BigDecimal.sum(sum, BigDecimal.fromBigInt(batch.withdrawableAmount)),
                BigDecimal.fromBigInt(BigInt(0)),
            )

            const totalAmount = toRawAmount(totalAmountBigDecimal, 0)

            const tokenOrder = yield* TokenOrder.make({
                source: unionChain,
                destination: ethereumChain,
                sender: proxy,
                receiver: sender,
                baseToken: Token.CosmosBank.make({ address: params.LST_CONFIG.quoteTokenCosm }),
                baseAmount: totalAmount,
                quoteToken: Token.Erc20.make({ address: params.LST_CONFIG.uEvmAddress }),
                quoteAmount: totalAmount,
                kind: "solve",
                metadata: params.LST_CONFIG.U_SOLVER_ON_ETH_METADATA,
                version: 2,
            })

            const salt = yield* Utils.generateSalt("cosmos")
            const timeout_timestamp = Utils.getTimeoutInNanoseconds24HoursFromNow().toString()

            const sendCall = yield* pipe(
                tokenOrder,
                TokenOrder.encodeV2,
                Effect.flatMap(Schema.encode(Ucs03.Ucs03WithInstructionFromHex)),
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
                            funds: [
                                { denom: "au", amount: totalAmount.toString() },
                            ],
                        },
                    },
                })),
            )

            const calls = yield* pipe(
                [...withdrawCalls, sendCall],
                Schema.decode(HexFromJson),
                Effect.map((contractCalldata) =>
                    Call.make({
                        sender: Ucs05.EvmDisplay.make({
                            address: sender,
                        }),
                        eureka: false,
                        contractAddress: proxy,
                        contractCalldata,
                    })
                ),
            )

            const batchInstruction = Batch.make([
                calls,
            ])

            const request = ZkgmClientRequest.make({
                source: ethereumChain,
                destination: unionChain,
                channelId: ChannelId.make(params.LST_CONFIG.channelId),
                ucs03Address: params.LST_CONFIG.ucs03Address,
                instruction: batchInstruction,
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

    return {
        query,
        withdraw,
        statusPrepare,
        statusOperation
    }
}

const getUnionWithdraw = async (evmAddress: Address | undefined): Promise<UnionWithdraw[]> => {
    if (!evmAddress) throw "Invalid address";

    const LST_CONFIG = UNION_CONTRACTS.mainnet;
    const lcd = "https://rest.union.build";

    const proxyAddress = await Effect.runPromise(getProxyAddressFromEvm({
        path: BigInt(0),
        channel: LST_CONFIG.destinationChannelId,
        sender: evmAddress,
        ucs03Address: LST_CONFIG.ucs03AddressOnUnion,
        bytecode_base_checksum: LST_CONFIG.bytecode_base_checksum,
        module_hash: LST_CONFIG.module_hash
    }));

    // get user unstakes
    const queryUserUnstakes = {
        unstake_requests_by_staker: { staker: proxyAddress.address },
    } as const;
    const responseUserUnstakes = await fetchCosmosQuery({
        lcd,
        contract: LST_CONFIG.lstAtUnionAddress,
        query: queryUserUnstakes
    });
    const userUnstakes = responseUserUnstakes.data as UnionUserUnstakes[];

    // get batches by ids
    const batchIds = userUnstakes.map((v: { batch_id: string }) => v.batch_id)
    const queryBatchesByIds = {
        batches_by_ids: { batch_ids: batchIds },
    } as const;
    const responseBatches = await fetchCosmosQuery({
        lcd,
        contract: LST_CONFIG.lstAtUnionAddress,
        query: queryBatchesByIds
    });
    const batches = responseBatches.data.batches as UnionBatch[];

    // Indexer
    const indexerWithdraws = await getIndexerWithdraws(evmAddress);

    // claimable batch
    const claimableBatch = batches.filter(v =>
        v.batch.status === "received" &&
        !(indexerWithdraws?.pending ?? []).includes(v.batch_id)
    );

    // user batch
    const userBatches: UnionWithdraw[] = userUnstakes.map(v => {
        const batch = claimableBatch.find(cb => cb.batch_id === v.batch_id);
        if (batch && BigInt(batch.batch.total_lst_to_burn) > BigInt(0)) {
            return {
                batch_id: v.batch_id,
                withdrawableAmount: BigInt(v.amount) * BigInt(batch.batch.received_native_unstaked) / BigInt(batch.batch.total_lst_to_burn)
            }
        }
        return undefined;
    }).filter(v => v !== undefined);

    // console.log({ userUnstakes, batches, indexerWithdraws, claimableBatch, userBatches });

    return userBatches;
}

export const getIndexerWithdraws = async (evmAddress: Address) => {
    try {
        const res = await getUnionWithdrawByAddress(evmAddress);
        return {
            pending: res?.
                filter(v => v.delivery_success !== true).
                flatMap(v => (v.batches ? Object.keys(v.batches) : [])) ?? [],
            success: res?.
                filter(v => v.delivery_success === true).
                flatMap(v => (v.batches ? Object.keys(v.batches) : [])) ?? [],
        }
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

const toRawAmount = (bd: BigDecimal.BigDecimal, decimals: number = 18): bigint => {
    const normalized = BigDecimal.normalize(bd)
    const scaleFactor = BigInt(decimals) - BigInt(normalized.scale)
    return scaleFactor >= BigInt(0)
        ? normalized.value * (BigInt(10) ** scaleFactor)
        : normalized.value / (BigInt(10) ** (-scaleFactor))
}
