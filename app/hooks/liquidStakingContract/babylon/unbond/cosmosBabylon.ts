import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { getExecuteAllowanceMsg, getExecuteContractMessage, getIbcChannelId } from "@/lib/cosmos";
import { BRIDGE_TOKENS } from "@/lib/ucs03";
import { EncodeObject } from "@cosmjs/proto-signing";
import { UnbondCosmosParams } from "../unbond";
import { CHAINS } from "@/configs/chains";

export const getMsgsBabylon = (
    params: UnbondCosmosParams,
    unbondAmount: string,
    recipientChannelId: number | undefined
): EncodeObject[] => {
    const sender = params.chainContext.address;
    if (!sender) {
        throw ("Account not connected");
    }

    const bridgeToken = BRIDGE_TOKENS.get("eBABY");
    if (!bridgeToken) {
        console.error({ params });
        throw "Bridge not found";
    }

    const baseToken = bridgeToken.baseToken.get(params.token.chain.id);

    if (
        baseToken === undefined
    ) {
        console.error("Invalid data", {
            baseToken,
            params,
        });
        throw "Invalid data";
    }

    let recipient: unknown;
    switch (params.tokenReceive.chain.network) {
        case "evm": {
            recipient = {
                zkgm: {
                    address: params.receiver,
                    channel_id: recipientChannelId ?? null,
                },
            } as const
            break;
        }
        case "cosmos": {
            if (recipientChannelId) {
                // get ibc channel from LST to destination
                const ibcChannel = getIbcChannelId(CHAINS.babylon.id, params.tokenReceive.chain.id);
                recipient = {
                    ibc: {
                        address: params.receiver,
                        ibc_channel_id: ibcChannel.source
                    }
                } as const
            } else {
                recipient = {
                    on_chain: {
                        address: params.receiver
                    }
                } as const
            }
            break;
        }
    }

    const unbondingPayload = {
        unbond: {
            amount: unbondAmount,
            recipient: recipient,
        },
    };


    const allowanceMsg = getExecuteAllowanceMsg(
        baseToken,
        sender,
        BABYLON_CONTRACTS.lst,
        unbondAmount
    );


    const executeUnbondingMsg = getExecuteContractMessage(
        sender,
        BABYLON_CONTRACTS.lst,
        unbondingPayload,
        [],
    );

    const msgs: EncodeObject[] = [allowanceMsg, executeUnbondingMsg];

    console.log({
        unbondingPayload,
        msgs
    });

    return msgs;
}