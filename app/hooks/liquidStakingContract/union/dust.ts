import { useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { UNION_CONTRACTS, UnionContract } from "@/configs/union";
import { EMV_CHAINS } from "@/configs/wagmi";
import { parseLocalDustData } from "@/hooks/local/useLocalDust";
import { getUnionDustStatus, getUnionDustStatusByAddress } from "@/hooks/unionIndexer/dust";
import { sleep } from "@/lib";
import { getProxyAddressFromEvm } from "@/lib/union";
import { getWagmiConnectorClient } from "@/lib/union-sdk";
import { formatDecimal, JsonFromBase64 } from "@/lib/utils";
import { ProgressStatus } from "@/types/status";
import { LocalDust } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";
import { Batch, Call, Token, TokenOrder, Ucs03, Ucs05, Utils, ZkgmClient, ZkgmClientRequest, ZkgmClientResponse, ZkgmIncomingMessage } from "@unionlabs/sdk";
import { Evm, EvmZkgmClient } from "@unionlabs/sdk-evm";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import { Effect, Logger, Option, pipe, Schema } from "effect";
import { useState } from "react";
import { Address, custom, http } from "viem";
import { mainnet } from "viem/chains";
import { useSwitchChain } from "wagmi";

interface UnionDust {
    amountRaw: bigint
    amount: number
    chainDust: bigint
    indexerDust?: {
        total: bigint
        pending: bigint
        success: bigint
    }
}

const getUnionDust = async (evmAddress: Address | undefined): Promise<UnionDust> => {
    if (!evmAddress) throw "Invalid address";

    const LST_CONFIG = UNION_CONTRACTS.mainnet;

    const proxyAddress = await Effect.runPromise(getProxyAddressFromEvm({
        path: BigInt(0),
        channel: LST_CONFIG.destinationChannelId,
        sender: evmAddress,
        ucs03Address: LST_CONFIG.ucs03AddressOnUnion,
        bytecode_base_checksum: LST_CONFIG.bytecode_base_checksum,
        module_hash: LST_CONFIG.module_hash
    }));

    const lcd = "https://rest.union.build";
    const query = {
        balance: { address: proxyAddress.address },
    } as const;

    const encoded = Buffer.from(JSON.stringify(query)).toString('base64');
    const url = `${lcd.replace(/\/$/, '')}/cosmwasm/wasm/v1/contract/${LST_CONFIG.eUUnionAddress}/smart/${encoded}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    const result = (await res.json()).data;
    const chainDust = BigInt(result.balance);

    // Indexer
    const indexerDust = await getIndexerDust(evmAddress);

    // DEBUG
    // let amountRaw = BigInt(543321*10**18);
    let amountRaw = chainDust - (indexerDust?.pending ?? BigInt(0));
    if (amountRaw < 0) amountRaw = chainDust;

    return {
        amountRaw,
        amount: formatDecimal(Number(amountRaw), -18),
        chainDust,
        indexerDust
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateAndGetLocalDust = async () => {
    try {
        const localDataString = localStorage.getItem(APP_CONFIG.dbDust);
        let currentDusts: LocalDust[] = [];
        if (localDataString) {
            currentDusts = parseLocalDustData(localDataString);
        }
        const newDusts: LocalDust[] = [];

        const res = await getUnionDustStatus(currentDusts.filter(v => v.status === "pending").map(v => v.transactionHash));
        currentDusts.map(v => {
            const a = res.find(r => r.packet_send_transaction_hash === v.transactionHash);
            newDusts.push({
                ...v,
                status: (a?.success === true) ? "success" : "pending"
            });
        })
        localStorage.removeItem(APP_CONFIG.dbDust);
        localStorage.setItem(APP_CONFIG.dbDust, JSON.stringify(newDusts));

        return newDusts.filter(v => v.status === "pending");
    } catch (error) {
        console.error(error);
        return [];
    }
}

const getIndexerDust = async (evmAddress: Address) => {
    try {
        const res = await getUnionDustStatusByAddress(evmAddress);
        return {
            total: res?.
                filter(v => v.quote_token === UNION_CONTRACTS.mainnet.eUEvmAddress).
                reduce((sum, cur) => sum += BigInt(cur.quote_amount), BigInt(0)) ?? BigInt(0),
            pending: res?.
                filter(v => v.quote_token === UNION_CONTRACTS.mainnet.eUEvmAddress && v.delivery_success !== true).
                reduce((sum, cur) => sum += BigInt(cur.quote_amount), BigInt(0)) ?? BigInt(0),
            success: res?.
                filter(v => v.quote_token === UNION_CONTRACTS.mainnet.eUEvmAddress && v.delivery_success === true).
                reduce((sum, cur) => sum += BigInt(cur.quote_amount), BigInt(0)) ?? BigInt(0),
        }
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

export const useUnionDust = () => {
    const { account } = useEscher();

    return useQuery({
        queryKey: ["lst", "union", "dust", account.evm?.address],
        queryFn: () => getUnionDust((account.evm?.address as Address | undefined)),
        enabled: !!account.evm?.address,
        refetchInterval: APP_CONFIG.refetchIntervalFast10s
    });
}

interface DustParams {
    dustAmountRaw: bigint
}

export const useUnionDustRecovery = () => {
    const { account, updateTimestampTransaction } = useEscher();
    const { mutateAsync: switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');

    const dustRecovery = async (params: DustParams) => {

        const LST_CONFIG = UNION_CONTRACTS.mainnet;

        console.log('initiating : useUnionDustRecovery', { params, lst: LST_CONFIG });
        setStatusPrepare('onProgress');

        // DEBUG
        // const testSuccessHash = "0x1599eee430321751d336493b6f61c4ab45d9cd5fc4d9f99a377aa6ac91de59de";
        // // const testSuccessHash = "0x700ea1bdd03da4063d1955cace7d69fc4f0f6b0aeb256a545b6c47d09acc928a"; // null success
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusOperation('onProgress');
        // await sleep(1);
        // setStatusOperation('success');
        // return testSuccessHash;

        await switchChainAsync({ chainId: Number(mainnet.id) });

        try {
            const sender = account.evm?.address as Address | undefined;
            if (!sender) throw "Invalid account";

            setStatusPrepare('success');

            setStatusOperation("onProgress");
            const result = await Effect.runPromise(zkgmDustRecovery({
                // DEBUG
                // dustAmountRaw: BigInt(0.0001 * 10 ** 18), // 0.0001
                dustAmountRaw: params.dustAmountRaw,
                LST_CONFIG: LST_CONFIG,
                sender
            }));
            console.log({ result });

            const receipt = Option.getOrElse(result, () => undefined);
            const hash = receipt?.transactionHash;

            if (hash === undefined) {
                throw "Failed to get transaction receipt"
            }

            console.log('Dust receipt', hash);
            updateTimestampTransaction();
            await sleep(5);
            setStatusOperation('success');

            return hash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const zkgmDustRecovery = (params: {
        LST_CONFIG: UnionContract
        dustAmountRaw: bigint
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


            // Give allowance to UCS03_MINTER to spend the eU dust
            const increaseAllowanceCall = yield* pipe(
                {
                    increase_allowance: {
                        spender: params.LST_CONFIG.ucs03MinterOnUnionAddress,
                        amount: params.dustAmountRaw.toString(),
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
            yield* Effect.log({ increaseAllowanceCall });

            const salt = yield* Utils.generateSalt("cosmos")
            const timeout_timestamp = Utils.getTimeoutInNanoseconds24HoursFromNow().toString()

            // Send the eU back to Ethereum
            const sendCall = yield* pipe(
                TokenOrder.make({
                    source: unionChain,
                    destination: ethereumChain,
                    sender: proxy,
                    receiver: sender,
                    baseToken: Token.Cw20.make({ address: params.LST_CONFIG.eUUnionAddress }),
                    baseAmount: params.dustAmountRaw,
                    quoteToken: params.LST_CONFIG.eUEvmAddress,
                    quoteAmount: params.dustAmountRaw,
                    kind: "solve",
                    metadata: params.LST_CONFIG.EU_FROM_UNION_SOLVER_METADATA,
                    version: 2,
                }),
                Effect.tap((data) => Effect.log("TokenOrder:", data)),
                Effect.flatMap(TokenOrder.encodeV2),
                Effect.tap((data) => Effect.log("TokenOrder.encodeV2:", data)),
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
                            funds: [],
                        },
                    },
                })),
            )
            yield* Effect.log({ sendCall });

            const calls = yield* pipe(
                [increaseAllowanceCall, sendCall],
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
            yield* Effect.log({ calls });

            const batchInstruction = Batch.make([calls])

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _saveLocalDust = (newData: LocalDust) => {
        const localData = localStorage.getItem(APP_CONFIG.dbDust);
        let currentData: LocalDust[] = [];
        if (localData) {
            currentData = parseLocalDustData(localData);
        }
        const updatedData = [...currentData, newData];
        localStorage.setItem(APP_CONFIG.dbDust, JSON.stringify(updatedData));
    };

    return {
        dustRecovery,
        statusOperation,
        statusPrepare
    }
}