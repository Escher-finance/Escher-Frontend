import { CHAINS } from "@/configs/chains";
import { getDateNow } from "@/lib/date";
import { encodeInstruction, encodeTokenOrderV2, getTokenOrderV2, GetTokenOrderV2Params } from "@/lib/protocol";
import { getSalt } from "@/lib/salt";
import { BRIDGE_TOKENS, CHANNEL_ID } from "@/lib/ucs03";
import { formatDecimal, getTimeoutInNanoseconds24HoursFromNow } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { toUtf8 } from "@cosmjs/encoding";
import { ChainContext } from "@cosmos-kit/core";
import { Instruction } from "@unionlabs/sdk/Ucs03";
import { MsgExecuteContract } from "osmojs/cosmwasm/wasm/v1/tx";
import { useState } from "react";
import { toHex } from "viem";
import { useLocalTransactions } from "../local/useLocalTransactions";

const zkgm_token_minter = "bbn1c723xf74f0r9g4uyn0cv2t7pkgcq7x0gaw5h773j78rk35w0j0usslxen6";
const getExecuteAllowanceMsg = (contract: string, sender: string, spender: string, amount: string) => {
    const allowanceMsg = {
        increase_allowance: {
            spender,
            amount,
        }
    }
    const executeAllowanceMsg = {
        typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
        value: MsgExecuteContract.fromPartial({
            sender,
            contract,
            msg: toUtf8(JSON.stringify(allowanceMsg)),
            funds: []
        }),
    };
    return executeAllowanceMsg;
}

interface CosmosBridgeParams {
    senderAddress: string
    recipientAddress: string
    chainContext: ChainContext
    amount: string
    tokenIn: CustomToken
    tokenOut: CustomToken
}

interface CosmosBridgeMultipleParams {
    senderAddress: string
    recipientAddress: string
    chainContext: ChainContext
    amount0: string
    amount1: string
}

export const useCosmosBridge = () => {
    // const testSuccessHash = "89FA1631DA8CF5D0A537C8E91103931D58C66E3550A876BC0CB0724258E41E1E"; // babylon
    // const testSuccessHash = "D0147A2C079C522E33046485716BCCCBA36DF81DD68CF4F22DB181A64C526C98"; // osmosis
    // const testSuccessHash = "E13439F5A22BCEC85C6894EC9177CC0968AF1EFBBDC392491AF3CAB8A86C0C22"; // baby->eth

    const { saveData } = useLocalTransactions();
    const [isPending, setIsPending] = useState(false);
    const [successHash, setSuccessHash] = useState<string>();
    const [error, setError] = useState<string>();

    const bridge = async (params: CosmosBridgeParams) => {
        setIsPending(true);
        setSuccessHash(undefined);
        setError(undefined);

        // DEBUG
        // await sleep(1);
        // setSuccessHash(testSuccessHash);
        // saveLocal(params, testSuccessHash);
        // setIsPending(false);
        // return;

        try {
            const amount = BigInt(formatDecimal(Number(params.amount), params.tokenIn.decimals).toFixed(0));
            const client = await params.chainContext.getSigningCosmWasmClient();
            console.log({ chainContext: params.chainContext, client });

            const bridgeToken = BRIDGE_TOKENS.get(params.tokenIn.symbol);
            if (!bridgeToken) {
                console.error({ params });
                throw "Bridge not found";
            }

            const baseToken = bridgeToken.baseToken.get(params.tokenIn.chain.id);
            const baseTokenName = bridgeToken.baseTokenName;
            const baseTokenPath = bridgeToken.baseTokenPath.get(params.tokenIn.chain.id);
            const tokenOrderKind = bridgeToken.tokenOrderKind.get(params.tokenIn.chain.id);
            const channelId = CHANNEL_ID.get(params.tokenIn.chain.id)?.get(params.tokenOut.chain.id);
            const quoteToken = bridgeToken.quoteToken.get(params.tokenOut.chain.id);
            const ucs03Contract = bridgeToken.ucs03_contract.get(params.tokenIn.chain.id);

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

            const getTokenOrderV2Params: GetTokenOrderV2Params = {
                baseAmount: amount,
                baseToken: baseToken,
                metadata: toHex(""),
                quoteAmount: amount,
                quoteToken: quoteToken.hex,
                receiver: params.recipientAddress,
                sender: params.senderAddress,
                tokenOrderKind

            } as const;

            const tokenOrder = getTokenOrderV2(getTokenOrderV2Params);

            const timeout_timestamp = getTimeoutInNanoseconds24HoursFromNow().toString();

            const msg = {
                send: {
                    channel_id: channelId.source,
                    timeout_height: "0",
                    timeout_timestamp,
                    salt: getSalt(),
                    instruction: encodeInstruction(Instruction.make({
                        opcode: 3,
                        version: 2,
                        operand: encodeTokenOrderV2(tokenOrder),
                    })),
                },
            }

            const msgs = [];
            const funds: { denom: string, amount: string }[] = [];

            switch (params.tokenIn.chain.id) {
                /* 
                case CHAINS.babylon.id:
                    if (params.tokenOut.chain.id === CHAINS.mainnet.id) {
                        funds.push({
                            denom: "ubbn",
                            amount: Number(20_000_000).toFixed(0)
                            // amount: Number(100).toFixed(0)
                        })
                    } else {
                        funds.push({
                            denom: "ubbn",
                            amount: Number(100).toFixed(0)
                        });
                    }
                    break;
                */
                case CHAINS.osmosis.id:
                    funds.push({
                        denom: params.tokenIn.denom!,
                        amount: amount.toString()
                    });
                    break;
            }

            if ([CHAINS.babylon.id].includes(params.tokenIn.chain.id)) {
                const executeAllowanceMsg = getExecuteAllowanceMsg(baseToken, params.senderAddress, zkgm_token_minter, amount.toString());
                msgs.push(executeAllowanceMsg);
            }
            const executeSendMsg = {
                typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                value: MsgExecuteContract.fromPartial({
                    sender: params.senderAddress,
                    contract: ucs03Contract,
                    msg: toUtf8(JSON.stringify(msg)),
                    funds
                }),
            };
            msgs.push(executeSendMsg);

            console.log({
                ucs03Contract,
                getTokenOrderV2Params,
                tokenOrderMsg: msg,
                funds,
                msgs
            });

            const res = await client.signAndBroadcast(params.senderAddress, msgs, "auto", "");
            console.log({ transactionHash: res.transactionHash });
            saveLocal(params, res.transactionHash);
            setSuccessHash(res.transactionHash);
        } catch (error) {
            console.error(error);
            setError(error as string);
        }

        setIsPending(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bridgeMultiple = async (params: CosmosBridgeMultipleParams) => {
        setIsPending(true);
        setSuccessHash(undefined);
        setError(undefined);

        // DEBUG
        // await sleep(1);
        // setSuccessHash(testSuccessHash);
        // setIsPending(false);
        // return;

        try {
            throw "Unimplemented";
            /*
            const token0 = EBABY_TOKENS.babylon;
            const token0_out = EBABY_TOKENS.osmosis;
            const amount0 = BigInt(formatDecimal(Number(params.amount0), token0.decimals).toFixed(0));
            const token1 = BABY_TOKENS.babylon;
            const token1_out = BABY_TOKENS.osmosis;
            const amount1 = BigInt(formatDecimal(Number(params.amount1), token1.decimals).toFixed(0));
            const channel_id = 4;
            const ucs03_contract = "bbn1336jj8ertl8h7rdvnz4dh5rqahd09cy0x43guhsxx6xyrztx292q77945h";

            const client = await params.chainContext.getSigningCosmWasmClient();
            let msgs = [];

            const cosmosIntent: TransferIntent = {
                sender: params.senderAddress,
                receiver: params.recipientAddress,
                baseToken: token0.denom!,
                baseAmount: BigInt(amount0),
                baseTokenSymbol: token0.symbol,
                baseTokenName: "ebbn",
                quoteToken: toHex(token0_out.denom!),
                quoteAmount: BigInt(amount0),
                baseTokenPath: BigInt(0),
                baseTokenDecimals: token0.decimals
            } as const

            const batch_instruction = transferInstruction(cosmosIntent);
            const timeout_timestamp = getTimeoutInNanoseconds24HoursFromNow().toString();

            let ucs03_msg = {
                send: {
                    channel_id,
                    timeout_height: "0",
                    timeout_timestamp,
                    salt: getSalt(),
                    instruction: encodeAbiParameters(instructionAbi, [
                        0,
                        2,
                        Instruction.encodeAbi(batch_instruction)
                    ])
                },
            }

            const executeAllowanceMsg = getExecuteAllowanceMsg(token0.denom!, params.senderAddress, zkgm_token_minter, amount0.toString());
            msgs.push(executeAllowanceMsg);

            const executeUcs03Msg = {
                typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                value: MsgExecuteContract.fromPartial({
                    sender: params.senderAddress,
                    contract: ucs03_contract,
                    msg: toUtf8(JSON.stringify(ucs03_msg)),
                    funds: []
                }),
            };
            console.log(executeUcs03Msg);
            msgs.push(executeUcs03Msg);

            const ibcTransferMsg = createSendIBCMsg({
                sender: params.senderAddress,
                denom: token1.denom!,
                amount: amount1.toString(),
                sourceChannel: "channel-3",
                receiver: params.recipientAddress,
                timeoutTimestamp: getTimeoutInNanoseconds24HoursFromNow(),
                memo: "Transfer baby from babylon to osmosis",
            });
            msgs.push(ibcTransferMsg);

            console.log({
                cosmosIntent: JSON.stringify(cosmosIntent),
                executeAllowanceMsg,
                executeUcs03Msg,
                ibcTransferMsg,
            });

            const res = await client.signAndBroadcast(params.senderAddress, msgs, "auto", "transfer baby and ebaby from babylon to osmosis");
            console.log({ transactionHash: res.transactionHash });
            setSuccessHash(res.transactionHash);
            */
        } catch (error) {
            console.error(error);
            setError(error as string);
        }

        setIsPending(false);
    };

    const saveLocal = (params: CosmosBridgeParams, hash: string) => {
        try {
            if (!params.tokenIn.denom) {
                throw "Unknown denom";
            }
            saveData({
                lst: "babylon",
                action: "bridge",
                amountA: formatDecimal(Number(params.amount), params.tokenIn.decimals).toFixed(0),
                amountB: formatDecimal(Number(params.amount), params.tokenOut.decimals).toFixed(0),
                denomA: params.tokenIn.denom,
                exchangeRate: 0,
                hash: hash,
                source: "local",
                status: "pending",
                submitted: undefined,
                time: getDateNow(),
                userAddress: params.senderAddress,
                recipient: params.recipientAddress,
                channelId: 0, // leave 0 since we are using token id
                recipientChannelId: 0, // same as above
                tokenIdA: params.tokenIn.id,
                tokenIdB: params.tokenOut.id,
            });
            console.log("Success save local");
        } catch (error) {
            console.error(error);
        }
    }

    return {
        bridge,
        bridgeMultiple,
        successHash,
        error,
        isPending
    }
}