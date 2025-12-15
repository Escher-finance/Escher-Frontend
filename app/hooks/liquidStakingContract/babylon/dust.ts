import { useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { EMV_CHAINS } from "@/configs/wagmi";
import { parseLocalDustData } from "@/hooks/local/useLocalDust";
import { getUnionPacketStatus } from "@/hooks/unionIndexer/packet";
import { sleep } from "@/lib";
import { getDateNow } from "@/lib/date";
import { CHANNEL_ID, UNIVERSAL_CHAIN_IDS } from "@/lib/ucs03";
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
import { Effect, Option, pipe, Schema } from "effect";
import { useState } from "react";
import { Address, custom, http } from "viem";
import { mainnet } from "viem/chains";
import { useSwitchChain } from "wagmi";

const LST_CONFIG = UNION_CONTRACTS.mainnet;

interface BabylonDust {
    amountRaw: bigint
    amount: number
    chainDust: bigint
    localDust?: bigint
}

const getBabylonDust = async (evmAddress: Address | undefined): Promise<BabylonDust> => {
    if (!evmAddress) throw "Invalid address";

    // channel Id for sending from source to lst
    const channelIdSend = CHANNEL_ID.get(CHAINS.mainnet.id)?.get(CHAINS.babylon.id);
    if (!channelIdSend) throw "Unknown send channel id";

    const proxyAddress = await Effect.runPromise(getProxyAddressFromEvm({
        path: BigInt(0),
        channel: ChannelId.make(channelIdSend.destination),
        sender: evmAddress,
        ucs03Address: BABYLON_CONTRACTS.ucs3Contract.babylon as `${string}1${string}`,
        bytecode_base_checksum: LST_CONFIG.bytecode_base_checksum,
        module_hash: LST_CONFIG.module_hash,
        prefix: "bbn"
    }));

    const lcd = "https://babylon.nodes.guru/api";
    const query = {
        balance: { address: proxyAddress.address },
    } as const;

    const encoded = Buffer.from(JSON.stringify(query)).toString('base64');
    const url = `${lcd.replace(/\/$/, '')}/cosmwasm/wasm/v1/contract/${BABYLON_CONTRACTS.liquidTokenAddress.babylon}/smart/${encoded}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    const result = (await res.json()).data;
    const chainDust = BigInt(result.balance);

    // Local dust
    const localDusts = await getAndUpdateLocalDust(evmAddress);
    const localDustsAmount = localDusts.reduce((sum, cur) => sum + BigInt(cur.amountRaw), BigInt(0))

    // DEBUG
    // let amountRaw = BigInt(543321*10**6);
    let amountRaw = chainDust - (localDustsAmount ?? BigInt(0));
    if (amountRaw < 0) amountRaw = chainDust;

    return {
        amountRaw,
        amount: formatDecimal(Number(amountRaw), -6),
        chainDust,
        localDust: localDustsAmount
    }
}

const getAndUpdateLocalDust = async (userAddress: string) => {
    try {
        const localDataString = localStorage.getItem(APP_CONFIG.dbDust);
        let currentDusts: LocalDust[] = [];
        if (localDataString) {
            currentDusts = parseLocalDustData(localDataString).filter(v => v.lst === "babylon" && v.userAddress === userAddress);
        }

        const results = await Promise.all(
            currentDusts
                .filter(v => v.status === "pending")
                .map(v => getUnionPacketStatus(v.transactionHash))
        );

        const newDusts: LocalDust[] = [];
        currentDusts.map(v => {
            const a = results.find(r => r.hash === v.transactionHash);
            let status = v.status;
            if (status === "pending") {
                status = (a?.recv === true) ? "success" : "pending"
            }
            newDusts.push({
                ...v,
                status
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

export const useBabylonDust = () => {
    const { account } = useEscher();

    return useQuery({
        queryKey: ["lst", "babylon", "dust", account.evm?.address],
        queryFn: () => getBabylonDust((account.evm?.address as Address | undefined)),
        enabled: !!account.evm?.address,
        refetchInterval: APP_CONFIG.refetchIntervalFast10s
    });
}

interface DustParams {
    dustAmountRaw: bigint
}

export const useBabylonDustRecovery = () => {
    const { account, updateTimestampTransaction } = useEscher();
    const { switchChainAsync } = useSwitchChain();

    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');

    const dustRecovery = async (params: DustParams) => {

        console.log('initiating : useBabylonDustRecovery', { params, lst: LST_CONFIG });
        setStatusPrepare('onProgress');

        const dustAmount = params.dustAmountRaw;
        // Debug
        // const dustAmount = BigInt(0.001 * 10 ** 6); // 0.001

        // DEBUG
        // const testSuccessHash = "0xc6ad3d840240d6c90f02ec9a62b461335927482008f33785976a25dd3a40c889";
        // // const testSuccessHash = "0x700ea1bdd03da4063d1955cace7d69fc4f0f6b0aeb256a545b6c47d09acc928a"; // null success
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusOperation('onProgress');
        // await sleep(1);
        // setStatusOperation('success');
        // saveLocalDust({
        //     amountRaw: dustAmount.toString(),
        //     lst: "babylon",
        //     status: "pending",
        //     transactionHash: testSuccessHash,
        //     userAddress: account.evm?.address ?? "",
        //     time: getDateNow()
        // });
        // return testSuccessHash;

        await switchChainAsync({ chainId: Number(mainnet.id) });

        try {
            const sender = account.evm?.address as Address | undefined;
            if (!sender) throw "Invalid account";

            setStatusPrepare('success');

            setStatusOperation("onProgress");
            const result = await Effect.runPromise(zkgmDustRecovery({
                dustAmountRaw: dustAmount,
                sender
            }));
            console.log({ result });

            const receipt = Option.getOrElse(result, () => undefined);
            const hash = receipt?.transactionHash;

            if (hash === undefined) {
                throw "Failed to get transaction receipt"
            }

            console.log('Dust receipt', hash);
            saveLocalDust({
                amountRaw: dustAmount.toString(),
                lst: "babylon",
                status: "pending",
                transactionHash: hash,
                userAddress: sender,
                time: getDateNow()
            });
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

        // channel Id for sending from source to lst
        const channelIdMainnetToBabylon = CHANNEL_ID.get(CHAINS.mainnet.id)?.get(CHAINS.babylon.id);
        if (!channelIdMainnetToBabylon) throw "Unknown send channel id";

        return yield* Effect.gen(function* () {
            const proxy = yield* getProxyAddressFromEvm({
                path: BigInt(0),
                channel: ChannelId.make(channelIdMainnetToBabylon.destination),
                sender: params.sender,
                ucs03Address: BABYLON_CONTRACTS.ucs3Contract.babylon as `${string}1${string}`,
                bytecode_base_checksum: LST_CONFIG.bytecode_base_checksum,
                module_hash: LST_CONFIG.module_hash,
                prefix: "bbn"
            });

            console.log({ sender: params.sender, proxy });

            const lstChainId = UNIVERSAL_CHAIN_IDS.get(CHAINS.babylon.id);
            const destinationChainId = UNIVERSAL_CHAIN_IDS.get(CHAINS.mainnet.id);
            if (!lstChainId || !destinationChainId) throw "Unknown universal chain Id";

            const lstChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(lstChainId),
            );
            const destinationChain = yield* ChainRegistry.byUniversalId(
                UniversalChainId.make(destinationChainId),
            );
            console.log({ lstChain, destinationChain });

            // Give allowance to UCS03_MINTER to spend the eBaby dust
            const increaseAllowanceCall = yield* pipe(
                {
                    increase_allowance: {
                        spender: BABYLON_CONTRACTS.tokenMinter,
                        amount: params.dustAmountRaw.toString(),
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
            console.log({ increaseAllowanceCall });

            const salt = yield* Utils.generateSalt("cosmos")
            const timeout_timestamp = Utils.getTimeoutInNanoseconds24HoursFromNow().toString()

            // Send the eU back to Ethereum
            const sendCall = yield* pipe(
                TokenOrder.make({
                    source: lstChain,
                    destination: destinationChain,
                    sender: proxy,
                    receiver: params.sender,
                    baseToken: Token.Cw20.make({ address: BABYLON_CONTRACTS.liquidTokenAddress.babylon }),
                    baseAmount: params.dustAmountRaw,
                    quoteToken: BABYLON_CONTRACTS.liquidTokenAddress.ethereum,
                    quoteAmount: params.dustAmountRaw,
                    kind: "escrow",
                    metadata: undefined,
                    version: 2,
                }),
                Effect.flatMap(TokenOrder.encodeV2),
                Effect.flatMap(Schema.encode(Ucs03.Ucs03WithInstructionFromHex)),
                Effect.map((instruction) => ({
                    send: {
                        channel_id: channelIdMainnetToBabylon.destination,
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
                            contract_addr: BABYLON_CONTRACTS.ucs3Contract.babylon,
                            msg,
                            funds: [],
                        },
                    },
                })),
            )
            console.log({ sendCall });

            const calls = yield* pipe(
                [increaseAllowanceCall, sendCall],
                Schema.decode(HexFromJson),
                Effect.map((contractCalldata) =>
                    Call.make({
                        sender: Ucs05.EvmDisplay.make({
                            address: params.sender,
                        }),
                        eureka: false,
                        contractAddress: proxy,
                        contractCalldata,
                    })
                ),
            )
            console.log({ calls });

            const batchInstruction = Batch.make([calls])

            const request = ZkgmClientRequest.make({
                source: destinationChain,
                destination: lstChain,
                channelId: ChannelId.make(channelIdMainnetToBabylon.source),
                ucs03Address: LST_CONFIG.ucs03Address,
                instruction: batchInstruction,
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

    const saveLocalDust = (newData: LocalDust) => {
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