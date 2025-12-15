import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { CustomToken } from "@/types/chain";
import { HexFromJson } from "@unionlabs/sdk/schema/hex";
import {
    Batch,
    BatchAbi,
    Call,
    CallAbi,
    Instruction,
    InstructionAbi,
    Schema,
    TokenOrderV2,
    TokenOrderV2Abi
} from "@unionlabs/sdk/Ucs03";
import { Schema as EffectSchema } from "effect";
import { encodeAbiParameters, Hex, toHex } from "viem";
import { getIbcChannelId } from "./cosmos";
import { CHANNEL_ID } from "./ucs03";

const TOKEN_ORDER_V2_VERSION = 2;
const OP_CODE_TOKEN_ORDER_V2 = 3;
const OP_CODE_CALL = 1;
const INSTR_VERSION_ZERO = 0;

declare global {
    interface BigInt {
        toJSON(): number;
    }
}

BigInt.prototype.toJSON = function () { return Number(this) }

// TokenOrderV2
export interface GetTokenOrderV2Params {
    sender: string
    receiver: string
    baseToken: string
    baseAmount: bigint
    quoteToken: `0x${string}`
    quoteAmount: bigint
    metadata: `0x${string}`
    tokenOrderKind: 0 | 1 | 2 | 3
}

export const getTokenOrderV2 = (
    {
        sender,
        receiver,
        baseToken,
        baseAmount,
        quoteToken,
        quoteAmount,
        metadata,
        tokenOrderKind
    }: GetTokenOrderV2Params
) => {

    const senderHex = sender.startsWith("0x") ? sender as Hex : toHex(sender);
    const receiverHex = receiver.startsWith("0x") ? receiver as Hex : toHex(receiver);
    const baseTokenHex = baseToken.startsWith("0x") ? baseToken as Hex : toHex(baseToken);

    const tokenOrderV2: TokenOrderV2 = TokenOrderV2.make({
        opcode: OP_CODE_TOKEN_ORDER_V2,
        version: TOKEN_ORDER_V2_VERSION,
        operand: [
            senderHex,
            receiverHex,
            baseTokenHex,
            baseAmount,
            quoteToken,
            quoteAmount,
            tokenOrderKind,
            metadata
        ]
    });

    return tokenOrderV2;
}

export const encodeTokenOrderV2 = (instruction: TokenOrderV2) => {
    return encodeAbiParameters(TokenOrderV2Abi(), instruction.operand);
}

// Call
export const getInstructionCall = (
    sender: string,
    contractAddress: string,
    payload: `0x${string}`
) => {

    const senderHex = sender.startsWith("0x") ? sender as Hex : toHex(sender);
    const contractAddressHex = contractAddress.startsWith("0x") ? contractAddress as Hex : toHex(contractAddress);

    const call: Call = Call.make({
        operand: [
            senderHex, //sender, bytes
            false, //eureka, bool
            contractAddressHex, //contractAddress, bytes
            payload, //contractCalldata, bytes
        ]
    });

    return call;
}

export const encodeCall = (call: Call) => {
    return encodeAbiParameters(CallAbi(), call.operand);
}

// Batch
export const getInstructionBatch = (
    instructions: [Schema, ...Schema[]]
) => {

    const batch = Batch.make({
        operand: instructions
    })

    return batch;
}

export const encodeInstruction = (instruction: Instruction) => {
    return encodeAbiParameters(
        InstructionAbi(),
        [instruction.version, instruction.opcode, instruction.operand] as const);
}

export const unbondSendToIBC = async (params: {
    amount: bigint
    baseToken: string
    lstToken: string
    proxyAddress: string
    recipientAddress: string
    sender: string
    tokenReceive: CustomToken
}
) => {
    const tokenOrderParams: GetTokenOrderV2Params = {
        baseAmount: params.amount,
        baseToken: params.baseToken,
        metadata: toHex(""),
        quoteAmount: params.amount,
        quoteToken: toHex(params.lstToken),
        receiver: params.proxyAddress,
        sender: params.sender.toLowerCase(),
        tokenOrderKind: 2
    } as const;

    console.log({ tokenOrderParams });

    const tokenOrder = getTokenOrderV2(tokenOrderParams);

    const calls = await getIBCUnbondCallsInstruction({
        amount: params.amount.toString(),
        cw20_address: BABYLON_CONTRACTS.liquidTokenAddress.babylon,
        lst_address: BABYLON_CONTRACTS.lst,
        proxy_address: params.proxyAddress,
        recipient_address: params.recipientAddress,
        sender: params.sender,
        tokenReceive: params.tokenReceive
    });

    // // Batch Call
    const batchCall: Batch = getInstructionBatch([tokenOrder]);

    const batchInstructions: [
        { version: number; opcode: number; operand: `0x${string}` }[],
    ] = [
            [
                // Tokenorder, send eBaby token
                {
                    version: tokenOrder.version,
                    opcode: tokenOrder.opcode,
                    operand: encodeTokenOrderV2(tokenOrder),
                },

                // Bond message
                {
                    version: calls.version,
                    opcode: calls.opcode,
                    operand: encodeCall(calls),
                },
            ],
        ];
    const batchOperand = encodeAbiParameters(BatchAbi(), batchInstructions);

    console.log({ batchInstructions });

    return Instruction.make({
        version: batchCall.version,
        opcode: batchCall.opcode,
        operand: batchOperand,
    });
};


export const getIBCUnbondCallsInstruction = async (
    params: {
        amount: string
        cw20_address: string
        lst_address: string
        proxy_address: string
        recipient_address: string
        sender: string
        tokenReceive: CustomToken
    }
) => {
    // give allowance to lst contract to transfer ebaby from proxy contract
    const allowancePayload = createIncreaseAllowance(
        params.lst_address,
        params.amount,
        params.cw20_address,
    );

    // call unbond to lst contract
    const unbondPayload = createIBCUnbondPayload({
        amount: params.amount,
        lst_address: params.lst_address,
        receiver: params.recipient_address,
        tokenReceive: params.tokenReceive
    });

    console.log({ allowancePayload, unbondPayload });

    // Calls
    const callsPayload = [allowancePayload, unbondPayload];

    const calls = callInstruction(
        params.sender.toLowerCase(),
        toHex(params.proxy_address),
        EffectSchema.decodeSync(HexFromJson)(callsPayload),
    );

    return calls;
};


export const createIncreaseAllowance = (
    spender: string,
    amount: string,
    contractAddress: string,
) => {
    // Allowance Call
    const allowanceMsg = {
        increase_allowance: {
            spender,
            amount,
        },
    } as const;
    const allowancePayload = {
        wasm: {
            execute: {
                contract_addr: contractAddress,
                msg: Buffer.from(JSON.stringify(allowanceMsg)).toString(
                    "base64",
                ),
                funds: [],
            },
        },
    };

    return allowancePayload;
};

export const createIBCUnbondPayload = ({
    amount,
    lst_address,
    receiver,
    tokenReceive,
}: {
    amount: string
    lst_address: string
    receiver: string
    tokenReceive: CustomToken
}) => {

    let recipient: unknown;
    switch (tokenReceive.chain.network) {
        case "evm": {
            // get channel from LST to destination
            const channelIdRecv = CHANNEL_ID.get(CHAINS.babylon.id)?.get(tokenReceive.chain.id);
            recipient = {
                zkgm: {
                    address: receiver,
                    channel_id: channelIdRecv?.source ?? null,
                },
            } as const
            break;
        }
        case "cosmos": {
            // if destination is same as LST (babylon)
            if (tokenReceive.chain.id === CHAINS.babylon.id) {
                recipient = {
                    on_chain: {
                        address: receiver
                    }
                } as const
            } else {
                // get ibc channel from LST to destination
                const ibcChannel = getIbcChannelId(CHAINS.babylon.id, tokenReceive.chain.id);
                recipient = {
                    ibc: {
                        address: receiver,
                        ibc_channel_id: ibcChannel.source
                    }
                } as const
            }
            break;
        }
    }

    const unbondMsg = {
        unbond: {
            amount,
            recipient,
        },
    } as const;

    const payload = {
        wasm: {
            execute: {
                contract_addr: lst_address,
                msg: Buffer.from(JSON.stringify(unbondMsg)).toString("base64"),
                funds: [],
            },
        },
    };

    console.log({
        unbondMsg,
        lst_address
    });

    return payload;
};

export const createOnchainUnbondPayload = ({
    lst_address,
    recipient_address,
    amount,
}: {
    lst_address: string;
    recipient_address: string;
    amount: string;
}) => {
    const unbondMsg = {
        unbond: {
            amount,
            recipient: {
                on_chain: {
                    address: recipient_address
                }
            },
        },
    } as const;

    const payload = {
        wasm: {
            execute: {
                contract_addr: lst_address,
                msg: Buffer.from(JSON.stringify(unbondMsg)).toString("base64"),
                funds: [],
            },
        },
    };

    console.log({
        unbondMsg,
        lst_address
    });

    return payload;
};

export const callInstruction = (
    sender: string,
    contractAddress: string,
    payload: `0x${string}`,
) => {
    const senderHex = sender.startsWith("0x") ? (sender as Hex) : toHex(sender);
    const contractAddressHex = contractAddress.startsWith("0x")
        ? (contractAddress as Hex)
        : toHex(contractAddress);

    const call: Call = Call.make({
        opcode: OP_CODE_CALL,
        version: INSTR_VERSION_ZERO,
        operand: [senderHex, false, contractAddressHex, payload],
    });

    return call;
};