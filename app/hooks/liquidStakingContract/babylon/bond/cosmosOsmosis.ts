import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { createSendIBCMsg, getIbcChannelId } from "@/lib/cosmos";
import { getSalt } from "@/lib/salt";
import { getTimeoutInNanoseconds24HoursFromNow, safeHex } from "@/lib/utils";
import { BondCosmosParams, transfer_fee } from "../bond";

export const getMsgsOsmosis = (params: BondCosmosParams, expected: number, bondAmount: string, recipientChannelId: number | undefined) => {
    if (!params.chainContext.address) {
        throw ("Account not connected");
    }
    if (!params.token.denom) {
        throw ("Invalid token");
    }

    // get IBC channel from source to LST (babylon)
    const ibcChannel = getIbcChannelId(params.token.chain.id, CHAINS.babylon.id);

    const recipient = recipientChannelId ?
        {
            zkgm: {
                address: safeHex(params.receiver),
                channel_id: recipientChannelId ?? null,
            },
        } as const
        :
        {
            on_chain: {
                address: params.receiver
            }
        } as const

    const payload = {
        dest_callback: {
            address: BABYLON_CONTRACTS.lst
        },
        salt: getSalt(),
        amount: bondAmount,
        recipient: recipient,
        min_mint_amount: expected.toString(),
    } as const

    // send ibc from source to LST
    const msg = createSendIBCMsg({
        sender: params.chainContext.address,
        denom: params.token.denom,
        amount: recipientChannelId !== undefined ? (BigInt(bondAmount) + transfer_fee).toString() : bondAmount,
        sourceChannel: ibcChannel.source,
        receiver: BABYLON_CONTRACTS.lst,
        timeoutTimestamp: getTimeoutInNanoseconds24HoursFromNow(),
        memo: JSON.stringify(payload),
    });
    console.log({ payload, msg: JSON.stringify(msg) });
    return [msg];
}