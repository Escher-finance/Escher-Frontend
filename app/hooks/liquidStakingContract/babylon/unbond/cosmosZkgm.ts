import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { UNION_CONTRACTS } from "@/configs/union";
import { getExecuteContractMessage } from "@/lib/cosmos";
import { encodeInstruction, unbondSendToIBC } from "@/lib/protocol";
import { getSalt } from "@/lib/salt";
import { getProxyAddressFromEvm } from "@/lib/union";
import { getTimeoutInNanoseconds7DaysFromNow } from "@/lib/utils";
import { EncodeObject } from "@cosmjs/proto-signing";
import { ChannelId } from "@unionlabs/sdk/schema/channel";
import { Effect } from "effect";
import { toHex } from "viem";
import { UnbondCosmosParams } from "../unbond";

export const getMsgsZkgm = async (
    params: UnbondCosmosParams,
    unbondAmount: string,
): Promise<EncodeObject[]> => {
    const sender = params.chainContext.address;
    if (!sender) {
        throw ("Account not connected");
    }
    const proxyAddress = await Effect.runPromise(
        getProxyAddressFromEvm({
            path: BigInt(0),
            channel: ChannelId.make(BABYLON_CONTRACTS.channelId.destination),
            sender: toHex(sender),
            ucs03Address: BABYLON_CONTRACTS.ucs3Contract.babylon as `${string}1${string}`,
            bytecode_base_checksum: UNION_CONTRACTS.mainnet.bytecode_base_checksum,
            module_hash: UNION_CONTRACTS.mainnet.module_hash,
            prefix: "bbn"
        }),
    );
    console.log({ proxyAddress });

    const callsInstruction = await unbondSendToIBC({
        amount: BigInt(unbondAmount),
        baseToken: params.token.denom!,
        lstToken: BABYLON_CONTRACTS.liquidTokenAddress.babylon,
        proxyAddress: proxyAddress.address,
        recipientAddress: params.receiver,
        sender,
        tokenReceive: params.tokenReceive
    });

    const sendMsg = {
        send: {
            channel_id: BABYLON_CONTRACTS.channelId.source,
            timeout_height: "0",
            timeout_timestamp:
                getTimeoutInNanoseconds7DaysFromNow().toString(),
            salt: getSalt(),
            instruction: encodeInstruction(callsInstruction),
        },
    };

    const executeSendMsg = getExecuteContractMessage(
        sender,
        BABYLON_CONTRACTS.ucs3Contract.osmosis,
        sendMsg,
        [
            {
                amount: unbondAmount,
                denom: params.token.denom
            },
        ],
    );

    return [executeSendMsg];
}
