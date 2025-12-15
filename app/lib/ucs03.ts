import { CHAINS } from "@/configs/chains";
import { EBABY_TOKENS } from "@/configs/token";
import { Batch, TokenOrderV1 } from "@unionlabs/sdk/Ucs03";
import { Hex, toHex } from "viem";
import { getUcs03Contract } from "./cosmos";

declare global {
    interface BigInt {
        toJSON(): number;
    }
}

BigInt.prototype.toJSON = function () { return Number(this) }

const TOKEN_ORDER_KIND = {
    INITIALIZE: 0 as 0 | 1 | 2 | 3,
    ESCROW: 1 as 0 | 1 | 2 | 3,
    UNESCROW: 2 as 0 | 1 | 2 | 3,
    SOLVE: 3 as 0 | 1 | 2 | 3
}

export const OP_CODE_CALL = 1;
export const INSTR_VERSION_ZERO = 0;

export interface TransferIntent {
    sender: string;
    receiver: string;
    baseAmount: bigint;
    baseToken: string
    baseTokenSymbol: string;
    baseTokenName: string;
    quoteToken: `0x${string}`;
    quoteAmount: bigint,
    baseTokenPath: bigint;
    baseTokenDecimals: number;
}

export const transferInstruction = ({
    baseTokenPath,
    sender,
    receiver,
    baseToken,
    baseAmount,
    baseTokenSymbol,
    baseTokenName,
    quoteToken,
    quoteAmount,
    baseTokenDecimals
}: TransferIntent
) => {
    const senderHex = sender.startsWith("0x") ? sender as Hex : toHex(sender);
    const receiverHex = receiver.startsWith("0x") ? receiver as Hex : toHex(receiver);
    const baseTokenHex = baseToken.startsWith("0x") ? baseToken as Hex : toHex(baseToken);

    const fungibleAssetOrder = TokenOrderV1.make({
        operand: [
            senderHex,
            receiverHex,
            baseTokenHex,
            baseAmount,
            baseTokenSymbol,
            baseTokenName,
            baseTokenDecimals,
            baseTokenPath,
            quoteToken, // Ensure quoteToken is a hex string
            quoteAmount,
        ]
    });


    return new Batch({
        operand: [
            fungibleAssetOrder,
        ]
    });
}

type ChainId = number | string;
interface BridgeToken {
    ucs03_contract: Map<ChainId, string>
    quoteToken: Map<ChainId, { address: string, hex: Hex }>
    baseToken: Map<ChainId, string>
    baseTokenSymbol: string
    baseTokenName: string
    baseTokenDecimals: number
    baseTokenPath: Map<ChainId, number>
    tokenOrderKind: Map<ChainId, 0 | 1 | 2 | 3>
}

export const CHANNEL_ID = new Map<ChainId, Map<ChainId, { source: number; destination: number }>>([
    [
        CHAINS.babylon.id,
        new Map<ChainId, { source: number; destination: number }>([
            [
                CHAINS.osmosis.id,
                {
                    source: 4,
                    destination: 1,
                },
            ],
            [
                CHAINS.mainnet.id,
                {
                    source: 3,
                    destination: 1,
                },
            ],
        ]),
    ],
    [
        CHAINS.osmosis.id,
        new Map<ChainId, { source: number; destination: number }>([
            [
                CHAINS.babylon.id,
                {
                    source: 1,
                    destination: 4,
                },
            ],
        ]),
    ],
    [
        CHAINS.mainnet.id,
        new Map<ChainId, { source: number; destination: number }>([
            [
                CHAINS.babylon.id,
                {
                    source: 1,
                    destination: 3,
                }
            ]
        ]),
    ],
]);

export const BRIDGE_TOKENS = new Map<string, BridgeToken>([
    [
        "eBABY", {
            ucs03_contract: new Map([
                [
                    CHAINS.babylon.id,
                    getUcs03Contract("babylon", CHAINS.babylon.id)
                ],
                [
                    CHAINS.osmosis.id,
                    getUcs03Contract("babylon", CHAINS.osmosis.id)
                ],
            ]),
            quoteToken: new Map([
                [
                    CHAINS.babylon.id,
                    {
                        address: EBABY_TOKENS.babylon.denom!,
                        hex: toHex(EBABY_TOKENS.babylon.denom!),
                    }
                ],
                [
                    CHAINS.osmosis.id,
                    {
                        address: EBABY_TOKENS.osmosis.denom!,
                        hex: toHex(EBABY_TOKENS.osmosis.denom!),
                    }
                ],
                [
                    CHAINS.mainnet.id,
                    {
                        address: EBABY_TOKENS.mainnet.contractAddress!,
                        hex: EBABY_TOKENS.mainnet.contractAddress!,
                    }
                ],
            ]),
            baseToken: new Map([
                [
                    CHAINS.babylon.id,
                    EBABY_TOKENS.babylon.denom!
                ],
                [
                    CHAINS.osmosis.id,
                    EBABY_TOKENS.osmosis.denom!
                ],
                [
                    CHAINS.mainnet.id,
                    EBABY_TOKENS.mainnet.contractAddress!.toLowerCase(),
                ],
            ]),
            baseTokenPath: new Map([
                [
                    CHAINS.babylon.id,
                    0
                ],
                [
                    CHAINS.osmosis.id,
                    1
                ],
                [
                    CHAINS.mainnet.id,
                    1
                ]
            ]),
            tokenOrderKind: new Map([
                [
                    CHAINS.babylon.id,
                    TOKEN_ORDER_KIND.ESCROW
                ],
                [
                    CHAINS.osmosis.id,
                    TOKEN_ORDER_KIND.UNESCROW
                ],
                [
                    CHAINS.mainnet.id,
                    TOKEN_ORDER_KIND.UNESCROW
                ],
            ]),
            baseTokenName: "ebbn",
            baseTokenSymbol: "eBABY",
            baseTokenDecimals: 6,
        }
    ]
])

export const UNIVERSAL_CHAIN_IDS = new Map<string | number, string>([
    [
        CHAINS.mainnet.id,
        "ethereum.1"
    ],
    [
        CHAINS.babylon.id,
        "babylon.bbn-1"
    ],
    [
        CHAINS.osmosis.id,
        "osmosis.osmosis-1"
    ],
])