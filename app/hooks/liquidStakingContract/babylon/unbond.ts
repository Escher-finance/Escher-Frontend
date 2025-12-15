import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { useLocalTransactions } from "@/hooks/local/useLocalTransactions";
import { sleep } from "@/lib";
import { getDestinationChannelId } from "@/lib/cosmos";
import { getDateNow } from "@/lib/date";
import { allowance, approve } from "@/lib/evm";
import { formatBigDecimal, formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { ProgressStatus } from "@/types/status";
import { EncodeObject } from "@cosmjs/proto-signing";
import { ChainContext } from "@cosmos-kit/core";
import { useChain } from "@cosmos-kit/react";
import { Effect, Option } from "effect";
import { useState } from "react";
import { PublicClient, WalletClient } from "viem";
import { useSwitchChain } from "wagmi";
import { getMsgsBabylon } from "./unbond/cosmosBabylon";
import { getMsgsZkgm } from "./unbond/cosmosZkgm";
import { zkgmUnbond } from "./unbond/evmEthereum";

export interface UnbondCosmosParams {
    amount: string,
    chainContext: ChainContext,
    estimateReceive: string,
    receiver: string,
    token: CustomToken,
    tokenReceive: CustomToken,
}
export interface UnbondEvmParams {
    amount: string
    estimateReceive: string
    publicClient: PublicClient
    receiver: string
    token: CustomToken
    tokenReceive: CustomToken
    walletClient: WalletClient
}

// const testHashBabyBaby = "91F065406A9A268CB35641E1019D2C754776724610A2DCA3B65B9794277A7F15";
// const testHashBabyOsmo = "2734B79BFDFFE47CB86EA0D7A9E886CCCD27B20C257AF4066B04B7A49AEE5D42";
// const testHashOsmoOsmo = "ADA467FFC1C0FEE2D295FD7D4CFBF3D96C50EC0B41BEFF5EBA15846B29A9AF5F";
// const testHashOsmoBaby = "499634FE679C015B158562B089BC3D942F299C9E2E8F1AD142936DF66E828005";


export const useBabylonUnbond = () => {
    const { saveData } = useLocalTransactions();
    const { switchChainAsync } = useSwitchChain();
    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');
    const { getCosmWasmClient: babylonGetCosmWasmClient } = useChain(CHAINS.babylon.chainName!);

    const unbondCosmos = async (params: UnbondCosmosParams) => {
        console.log('initiating useBabylonUnbond', { params });
        setStatusPrepare('onProgress');

        // DEBUG
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusOperation('onProgress');
        // saveLocal(params, testHashOsmoBaby)
        // await sleep(1);
        // setStatusOperation('success');
        // return testHashOsmoBaby;

        try {
            if (!params.chainContext.address) {
                throw ("Account not connected");
            }
            if (!params.token.denom) {
                throw ("Invalid denom");
            }

            const unbondAmount = formatDecimal(Number(params.amount), params.token.decimals).toFixed(0);

            if (Number(unbondAmount) <= 0) {
                throw ("Invalid amount");
            }

            const signingCosmWasmClient = await params.chainContext.getSigningCosmWasmClient();
            const clientChainId = await signingCosmWasmClient.getChainId();

            const recipientChannelId = getDestinationChannelId(
                "babylon",
                params.tokenReceive.chain.id
            );

            const babylonClient = await babylonGetCosmWasmClient();
            const liquidity = await babylonClient.queryContractSmart(
                BABYLON_CONTRACTS.lst,
                {
                    staking_liquidity: {}
                }
            );

            const undelegate_amount = Number(unbondAmount) * Number(liquidity.exchange_rate);

            const max_amount = Math.floor(liquidity.delegated / liquidity.exchange_rate);
            if (undelegate_amount >= liquidity.delegated) {
                throw ("Not enough fund to be undelegated, please reduce your unbonding amount to below < " + max_amount.toString());
            }

            let msgs: EncodeObject[] = [];
            switch (clientChainId) {
                case CHAINS.babylon.id:
                    msgs = getMsgsBabylon(params, unbondAmount, recipientChannelId);
                    break;
                case CHAINS.osmosis.id: {
                    msgs = await getMsgsZkgm(params, unbondAmount);
                    break;
                }
            }

            console.log({
                cw20: BABYLON_CONTRACTS.liquidTokenAddress.babylon,
                clientChainId,
                msgs,
            });
            setStatusPrepare("success");

            setStatusOperation('onProgress');
            const res = await signingCosmWasmClient?.signAndBroadcast(params.chainContext.address, msgs, "auto", "");
            console.log({ res });
            // saveLocal(params, res.transactionHash);
            await sleep(5);
            setStatusOperation('success');

            return res.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const unbondEvm = async (params: UnbondEvmParams) => {
        setStatusPrepare('onProgress');

        let LST_CONFIG;
        switch (params.token.chain.network_type) {
            case "mainnet": LST_CONFIG = UNION_CONTRACTS.mainnet; break;
            case "testnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
            case "devnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
        }

        console.log('initiating : unbondEvm', { params, LST_CONFIG });

        // DEBUG
        // const testSuccessHash = "0x431d1f18e2ef281aac795ea7876c0de18a6209b9e333d1e48b06bff11f25400a"; // eth->baby
        // const testSuccessHash = "0x5d1432999e42a8bfa455af877f3979e2f1b7c2233637b5cc51d87e8411f7b271"; // eth->eth
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusOperation('onProgress');
        // await sleep(1);
        // saveLocalEvm(params, testSuccessHash);
        // setStatusOperation('success');
        // return testSuccessHash;

        await switchChainAsync({ chainId: Number(params.token.chain.id) })

        try {
            const sender = params.walletClient.account?.address;

            if (
                !params.publicClient ||
                !params.walletClient ||
                !sender
            ) {
                console.error({ params });
                throw "Invalid params";
            }

            const amount = formatBigDecimal(params.amount, params.token.decimals);

            // Check allowance
            const curAllowance = await allowance({
                publicClient: params.publicClient,
                spender: LST_CONFIG.ucs03Address,
                tokenAddress: params.token.contractAddress as `0x${string}`,
                walletClient: params.walletClient
            });

            // Trigger approval token
            if (curAllowance < amount.value) {
                await approve({
                    amount: amount.value,
                    publicClient: params.publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: params.token.contractAddress as `0x${string}`,
                    walletClient: params.walletClient
                });
            }

            // Transfer
            const result = await Effect.runPromise(zkgmUnbond({
                amount: amount,
                receiver: params.receiver,
                sender,
                token: params.token,
                tokenReceive: params.tokenReceive,
            }));
            console.log({ result, json: result.toJSON() });

            const receipt = Option.getOrElse(result, () => undefined);
            const hash = receipt?.transactionHash;

            if (hash === undefined) {
                throw "Failed to get transaction receipt"
            }
            console.log('Transfer receipt', hash);

            await sleep(5);
            // saveLocalEvm(params, hash);
            setStatusOperation('success');

            return hash;

        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const saveLocal = (params: UnbondCosmosParams, hash: string) => {
        if (
            !params.chainContext.address ||
            !params.token.denom
        ) {
            console.error({
                addr: params.chainContext.address,
                denom: params.token.denom
            });

            return;
        };

        // TODO update once we fix the hash difference
        if ([CHAINS.osmosis.id].includes(params.token.chain.id)) {
            return;
        }

        try {
            saveData({
                lst: "babylon",
                action: "unbond",
                amountA: formatDecimal(Number(params.amount), params.token.decimals).toFixed(0),
                amountB: formatDecimal(Number(params.estimateReceive), params.tokenReceive.decimals).toFixed(0),
                denomA: params.token.denom,
                exchangeRate: 0,
                hash: hash,
                source: 'local',
                status: "pending",
                submitted: undefined,
                time: getDateNow(),
                userAddress: params.chainContext.address,
                recipient: params.receiver,
                channelId: 0, // leave 0 since we are using token id
                recipientChannelId: 0, // same as above
                tokenIdA: params.token.id,
                tokenIdB: params.tokenReceive.id,
            });
        } catch (error) {
            console.error(error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const saveLocalEvm = (params: UnbondEvmParams, hash: string) => {
        if (
            !params.walletClient.account?.address ||
            !params.token.contractAddress
        ) {
            console.error({
                addr: params.walletClient.account?.address,
                denom: params.token.contractAddress
            });

            return;
        };

        try {
            saveData({
                lst: "babylon",
                action: "unbond",
                amountA: formatDecimal(Number(params.amount), params.token.decimals).toFixed(0),
                amountB: formatDecimal(Number(params.estimateReceive), params.tokenReceive.decimals).toFixed(0),
                denomA: params.token.contractAddress,
                exchangeRate: 0,
                hash: hash,
                source: 'local',
                status: "pending",
                submitted: undefined,
                time: getDateNow(),
                userAddress: params.walletClient.account?.address,
                recipient: params.receiver,
                channelId: 0, // leave 0 since we are using token id
                recipientChannelId: 0, // same as above
                tokenIdA: params.token.id,
                tokenIdB: params.tokenReceive.id,
            });
        } catch (error) {
            console.error(error);
        }
    }

    return {
        unbondCosmos,
        unbondEvm,
        statusOperation,
        statusPrepare
    }
}