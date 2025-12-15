import { Action } from "@/types/transaction";
import { V2Packet } from "@/types/union-bond-unbond";
import { TokenOrder, Ucs03, Ucs05, Utils } from "@unionlabs/sdk";
import { ChainRegistry } from "@unionlabs/sdk/ChainRegistry";
import { UniversalChainId } from "@unionlabs/sdk/schema/chain";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { Effect, pipe, Schema } from "effect";
import { Address, bytesToHex, encodeAbiParameters, fromHex, keccak256 } from "viem";
import { getTimeoutInNanoseconds24HoursFromNow } from "./utils";

export const getTotalPhase = (operation: Action) => {
    switch (operation) {
        case "bond": return 8;
        case "unbond": return 5;
        case "towerRemove": return 5;
        case "towerAdd": return 5;
        case "bridge": return 5;
        case "dust": return 5;
        case "withdraw": return 5;
    }
}

interface GetUnionAddressFromEvmParams {
    path: bigint
    channel: ChannelId
    sender: `0x${string}`
    ucs03Address: `${string}1${string}`
    bytecode_base_checksum: `0x${string}`
    module_hash: `0x${string}`
    prefix?: string
}

export const getProxyAddressFromEvm = Effect.fn(
    function* (params: GetUnionAddressFromEvmParams) {

        const UCS03_ZKGM = Ucs05.CosmosDisplay.make({
            address: params.ucs03Address,
        });
        const canonical_zkgm = Ucs05.anyDisplayToCanonical(UCS03_ZKGM);

        const abi = [
            {
                name: "path",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "channelId",
                type: "uint32",
                internalType: "uint32",
            },
            {
                name: "sender",
                type: "bytes",
                internalType: "bytes",
            },
        ] as const

        const salt = yield* pipe(
            Effect.try(() =>
                encodeAbiParameters(
                    abi,
                    [
                        params.path,
                        params.channel,
                        params.sender,
                    ] as const,
                )
            ),
            Effect.map((encoded) => keccak256(encoded, "bytes")),
        )

        /**
         * `n` from U64 to big-endian bytes
         */
        const u64toBeBytes = (n: bigint) => {
            const buffer = new ArrayBuffer(8)
            const view = new DataView(buffer)
            view.setBigUint64(0, n)
            return new Uint8Array(view.buffer)
        }

        const sha256 = Effect.fn((data: ArrayBuffer) =>
            Effect.tryPromise(() => globalThis.crypto.subtle.digest("SHA-256", data))
        )

        const address = yield* pipe(
            Uint8Array.from(
                [
                    ...fromHex(params.module_hash, "bytes"),
                    ...new TextEncoder().encode("wasm"),
                    0, // null byte
                    ...u64toBeBytes(BigInt(32)), // checksum len as 64-bit big endian bytes of int
                    ...fromHex(params.bytecode_base_checksum, "bytes"),
                    ...u64toBeBytes(BigInt(32)), // creator canonical addr len
                    ...fromHex(canonical_zkgm, "bytes"),
                    ...u64toBeBytes(BigInt(32)), // len
                    ...salt,
                    ...u64toBeBytes(BigInt(0)),
                ],
            ).buffer,
            sha256,
            Effect.map((r) => new Uint8Array(r)),
            Effect.map(bytesToHex),
            Effect.flatMap(
                Schema.decode(Ucs05.Bech32FromCanonicalBytesWithPrefix(params.prefix ?? "union")),
            ),
        )

        return Ucs05.CosmosDisplay.make({ address })
    },
)

const JsonFromBase64 = Schema.compose(
    Schema.StringFromBase64,
    Schema.parseJson(),
)

interface GetSendbackCallMsgParams {
    sender: Address
    receiver: string
    minAmount: bigint
    baseToken: string
    quoteToken: string
    metadata: `0x${string}`
    channel_id: ChannelId
    ucs03AddressOnUnion: `${string}1${string}`
    sourceUniversalChainId: string
    destinationUniversalChainId: string
}

export const getSendbackCallMsg = (params: GetSendbackCallMsgParams) =>
    Effect.gen(function* () {

        const UCS03_ZKGM = Ucs05.CosmosDisplay.make({
            address: params.ucs03AddressOnUnion,
        });
        const SENDER = Ucs05.EvmDisplay.make({
            address: params.sender,
        })
        const MIN_MINT_AMOUNT = params.minAmount;
        const ETHEREUM_CHAIN_ID = UniversalChainId.make(params.destinationUniversalChainId);
        const UNION_CHAIN_ID = UniversalChainId.make(params.sourceUniversalChainId);

        const ethereumChain = yield* ChainRegistry.byUniversalId(ETHEREUM_CHAIN_ID);
        const unionChain = yield* ChainRegistry.byUniversalId(UNION_CHAIN_ID);

        const salt = yield* Utils.generateSalt("cosmos");

        const sendCall = yield* pipe(
            TokenOrder.make({
                source: unionChain,
                destination: ethereumChain,
                sender: Ucs05.CosmosDisplay.make({
                    address: params.receiver as '`${string}1${string}`',
                }),
                receiver: SENDER,
                baseToken: params.baseToken,
                baseAmount: MIN_MINT_AMOUNT,
                quoteToken: params.quoteToken,
                quoteAmount: MIN_MINT_AMOUNT,
                kind: "solve",
                metadata: params.metadata,
                version: 2,
            }),
            Effect.flatMap(TokenOrder.encodeV2),
            Effect.flatMap(Schema.encode(Ucs03.Ucs03WithInstructionFromHex)),
            Effect.map((instruction) => ({
                send: {
                    channel_id: params.channel_id,
                    timeout_height: BigInt(0).toString(),
                    timeout_timestamp: getTimeoutInNanoseconds24HoursFromNow().toString(),
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
        )
        return sendCall
    }).pipe(
        Effect.provide(ChainRegistry.Default),
    );

export const getUnionBondUnbond = async (params: { isTestnet?: boolean, type: 'bond' | 'unbond' }) => {
    const baseUrl = "https://graphql.union.build/v1/graphql";
    const query = params.isTestnet ?
        `p_destination_universal_chain_id: "union.union-testnet-10", p_source_universal_chain_id: "ethereum.17000"` :
        `p_destination_universal_chain_id: "union.union-1", p_source_universal_chain_id: "ethereum.1"`;

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query MyQuery {
                    v2_packets(
                        args: {${query}}
                    ) {
                        packet_hash
                        status
                        success
                        decoded
                    }
                }
            `,
        }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
        throw new Error(responseJson.errors?.[0]?.message || 'Failed to fetch data');
    }

    return getTx(responseJson.data.v2_packets as V2Packet[]);
}

const getTx = (data: V2Packet[]) => {
    const res = data.filter(v =>
        v.decoded.instruction.operand._type === "Batch" &&
        (v.decoded.instruction.operand.instructions?.length ?? 0) > 1
    ).map(v => {
        let type = "bond";
        let payload;
        let payloadString;

        try {
            payloadString = v.decoded.instruction.operand.instructions?.at(1)?.operand.contractCalldata !== undefined ?
                hexToString(v.decoded.instruction.operand.instructions.at(1)?.operand.contractCalldata ?? "") : undefined;
            payload = payloadString ? JSON.parse(payloadString) : undefined;

            payload = payload?.map((v: { wasm: { execute: { msg: string; contract_addr: string }; }; }) => {
                const msg = JSON.parse(base64ToString(v.wasm.execute.msg));
                if (msg.unbond) type = "unbond";

                return {
                    contract_addr: v.wasm.execute.contract_addr,
                    msg,
                    raw: v
                }
            });
        } catch (error) {
            console.error(error);
        }

        return {
            type,
            packet_hash: v.packet_hash,
            success: v.success,
            token_order: v.decoded.instruction.operand.instructions?.at(0)?.operand,
            call_data: payload,
        };
    })

    return res;
}

function hexToString(hex: string): string {
    return Buffer.from(hex.replace(/^0x/, ''), 'hex').toString('utf8')
}

function base64ToString(base64: string): string {
    return Buffer.from(base64, 'base64').toString('utf8')
}