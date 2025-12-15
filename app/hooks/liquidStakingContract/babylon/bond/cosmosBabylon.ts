import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { getExecuteAllowanceMsg, getExecuteContractMessage } from "@/lib/cosmos";
import { encodeInstruction, encodeTokenOrderV2, getTokenOrderV2, GetTokenOrderV2Params } from "@/lib/protocol";
import { getSalt } from "@/lib/salt";
import { BRIDGE_TOKENS, CHANNEL_ID } from "@/lib/ucs03";
import { getTimeoutInNanoseconds7DaysFromNow } from "@/lib/utils";
import { EncodeObject } from "@cosmjs/proto-signing";
import { Instruction } from "@unionlabs/sdk/Ucs03";
import { toHex } from "viem";
import { BondCosmosParams } from "../bond";

export const getMsgsBabylon = (params: BondCosmosParams, expected: number, bondAmount: string, recipientChannelId: number | undefined): EncodeObject[] => {
    const sender = params.chainContext.address;
    if (!sender) {
        throw ("Account not connected");
    }

    const bondMsg = {
        bond_v2: {
            min_mint_amount: expected.toString(),
            mint_to_address: sender.toLowerCase(),
        },
    };

    const funds = [{
        amount: bondAmount,
        denom: params.token.denom
    }];
    const executeBondingMsg = getExecuteContractMessage(
        sender,
        BABYLON_CONTRACTS.lst,
        bondMsg,
        funds
    );

    let msgs: EncodeObject[] = [executeBondingMsg];
    console.log({
        recipientChannelId,
        bondMsg,
        funds
    });


    // cross chain bond
    if (recipientChannelId) {
        const bridgeToken = BRIDGE_TOKENS.get("eBABY");
        if (!bridgeToken) {
            console.error({ params });
            throw "Bridge not found";
        }

        const baseToken = bridgeToken.baseToken.get(params.token.chain.id);
        const baseTokenName = bridgeToken.baseTokenName;
        const baseTokenPath = bridgeToken.baseTokenPath.get(params.token.chain.id);
        const tokenOrderKind = bridgeToken.tokenOrderKind.get(params.token.chain.id);
        const channelId = CHANNEL_ID.get(params.token.chain.id)?.get(params.tokenReceive.chain.id);
        const quoteToken = bridgeToken.quoteToken.get(params.tokenReceive.chain.id);
        const ucs03Contract = bridgeToken.ucs03_contract.get(params.token.chain.id);

        if (
            baseToken === undefined ||
            baseTokenName === undefined ||
            baseTokenPath === undefined ||
            channelId === undefined ||
            quoteToken === undefined ||
            tokenOrderKind === undefined ||
            ucs03Contract === undefined
        ) {
            console.error("Invalid data", {
                baseToken,
                baseTokenName,
                baseTokenPath,
                channelId,
                params,
                quoteToken,
                ucs03Contract,
            });
            throw "Invalid data";
        }

        const allowanceMsg = getExecuteAllowanceMsg(
            baseToken,
            sender,
            BABYLON_CONTRACTS.tokenMinter,
            expected.toString()
        );

        const tokenOrderParams: GetTokenOrderV2Params = {
            baseAmount: BigInt(expected),
            baseToken,
            metadata: toHex(""),
            quoteAmount: BigInt(expected),
            quoteToken: quoteToken.hex,
            receiver: params.receiver,
            sender,
            tokenOrderKind: 1
        } as const;

        const tokenOrder = getTokenOrderV2(tokenOrderParams);

        const cosmos_msg = {
            send: {
                channel_id: channelId.source,
                timeout_height: "0",
                timeout_timestamp: getTimeoutInNanoseconds7DaysFromNow().toString(),
                salt: getSalt(),
                instruction: encodeInstruction(
                    Instruction.make({
                        opcode: 3,
                        version: 2,
                        operand: encodeTokenOrderV2(tokenOrder),
                    }),
                ),
            },
        };

        const executeSendMsg = getExecuteContractMessage(
            sender,
            BABYLON_CONTRACTS.ucs3Contract.babylon,
            cosmos_msg,
            []
        );

        msgs = [executeBondingMsg, allowanceMsg, executeSendMsg];

        console.log({
            allowanceMsg,
            tokenOrderParams
        });
    }

    console.log({
        msgs
    });


    return msgs;
}