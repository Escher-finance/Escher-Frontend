import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { UNION_CONTRACTS } from "@/configs/union";
import { useLocalTransactions } from "@/hooks/local/useLocalTransactions";
import { sleep } from "@/lib";
import { adjustAmount, getDestinationChannelId } from "@/lib/cosmos";
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
import { getMsgsBabylon } from "./bond/cosmosBabylon";
import { getMsgsOsmosis } from "./bond/cosmosOsmosis";
import { zkgmBond } from "./bond/evmEthereum";

// const testHashBabyBaby = "7D82FDC2A5424F8DE5E6B98F8BEA6B5B582A2D572730CB4A0F89BCA6E59094DA";
// const testHashBabyOsmo = "B573AB0671A9EE197A50B14EA28E1F730D7D48F7AD4E2123D8F36A3D57A6258A";
// const testHashOsmoOsmo = "E2F0FD077C31D31B45E7342F0180B495C8B69B2DF1C2DF5ED0A04415AEDA08A8";
// const testHashOsmoBaby = "74EE63E6FCB115AEB0CA66AF54A7FEE9EBE043D163F115AEE6860CAEF4D67B18";
// const testHashBabyEth = "E0B96AF73B403B7F45D5447C2B0AFE2B935ABCA47109A87765F95B2788225B24";

export const transfer_fee = BigInt(0);
export interface BondCosmosParams {
    amount: string,
    chainContext: ChainContext,
    estimateReceive: string,
    receiver: string,
    token: CustomToken,
    tokenReceive: CustomToken,
}
export interface BondEvmParams {
    amount: string
    estimateReceive: string
    receiver: string
    token: CustomToken
    tokenReceive: CustomToken
    publicClient: PublicClient
    walletClient: WalletClient
}

export const useBabylonBond = () => {
    const { saveData } = useLocalTransactions();
    const { switchChainAsync } = useSwitchChain();
    const [statusPrepare, setStatusPrepare] = useState<ProgressStatus>('pending');
    const [statusOperation, setStatusOperation] = useState<ProgressStatus>('pending');
    const { getCosmWasmClient: babylonGetCosmWasmClient } = useChain(CHAINS.babylon.chainName!);

    const bondCosmos = async (params: BondCosmosParams) => {
        console.log('initiating : useBabylonBond', { params });
        setStatusPrepare('onProgress');

        // DEBUG
        // await sleep(1);
        // setStatusPrepare('success');
        // setStatusOperation('onProgress');
        // saveLocal(params, testHashBabyEth)
        // await sleep(1);
        // setStatusOperation('success');
        // return testHashBabyEth;

        try {
            if (!params.chainContext.address) {
                throw ("Account not connected");
            }
            if (!params.token.denom) {
                throw ("Invalid denom");
            }

            const bondAmount = formatDecimal(Number(params.amount), params.token.decimals).toFixed(0);

            if (Number(bondAmount) <= 0) {
                throw ("Invalid amount");
            }

            const signingCosmWasmClient = await params.chainContext.getSigningCosmWasmClient();
            const clientChainId = await signingCosmWasmClient.getChainId();

            // TODO remove this
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

            let expected = Math.floor(Number(bondAmount) / Number(liquidity.exchange_rate) * 0.995);

            let msgs: EncodeObject[] = [];
            switch (clientChainId) {
                case CHAINS.babylon.id: {
                    msgs = getMsgsBabylon(params, expected, bondAmount, recipientChannelId);

                    const adjustedAmount = await adjustAmount({
                        signingCosmWasmClient,
                        userAddress: params.chainContext.address,
                        token: params.token,
                        amount: params.amount,
                        lstContract: BABYLON_CONTRACTS.lst,
                        expected
                    });
                    console.log({
                        adjustedAmount,
                        bondAmount
                    });

                    if (adjustedAmount.bondAmount !== bondAmount) {
                        console.log("Adjusted bonding amount", adjustedAmount.bondAmount);

                        expected = Math.floor(Number(adjustedAmount.bondAmount) / Number(liquidity.exchange_rate));
                        msgs = getMsgsBabylon(params, expected, adjustedAmount.bondAmount, recipientChannelId);
                    }
                    break;
                }
                case CHAINS.osmosis.id:
                    msgs = getMsgsOsmosis(params, expected, bondAmount, recipientChannelId);
                    break;
            }

            console.log({
                msgs,
            });

            setStatusPrepare('success');

            setStatusOperation('onProgress');
            const res = await signingCosmWasmClient.signAndBroadcast(params.chainContext.address, msgs, "auto", "execute bond");
            console.log({ res });
            saveLocalCosmos(params, res.transactionHash);
            await sleep(5);
            setStatusOperation('success');

            return res.transactionHash;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const bondEvm = async (params: BondEvmParams) => {
        setStatusPrepare('onProgress');

        let LST_CONFIG;
        switch (params.token.chain.network_type) {
            case "mainnet": LST_CONFIG = UNION_CONTRACTS.mainnet; break;
            case "testnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
            case "devnet": LST_CONFIG = UNION_CONTRACTS.holesky; break;
        }

        console.log('initiating : bondEvm', { params, LST_CONFIG });

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

            const bondAmount = formatBigDecimal(params.amount, params.token.decimals);

            const babylonClient = await babylonGetCosmWasmClient();
            const liquidity = await babylonClient.queryContractSmart(
                BABYLON_CONTRACTS.lst,
                {
                    staking_liquidity: {}
                }
            );

            const expected = Math.floor(Number(bondAmount.value) / Number(liquidity.exchange_rate) * 0.995);

            // Check allowance
            const curAllowance = await allowance({
                publicClient: params.publicClient,
                spender: LST_CONFIG.ucs03Address,
                tokenAddress: params.token.contractAddress as `0x${string}`,
                walletClient: params.walletClient
            });

            // Trigger approval token
            if (curAllowance < bondAmount.value) {
                await approve({
                    amount: bondAmount.value,
                    publicClient: params.publicClient,
                    spender: LST_CONFIG.ucs03Address,
                    tokenAddress: params.token.contractAddress as `0x${string}`,
                    walletClient: params.walletClient
                });
            }

            // Transfer
            const result = await Effect.runPromise(zkgmBond({
                bondAmount,
                expected,
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
            saveLocalEvm(params, hash);
            setStatusOperation('success');

            return hash;

        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const saveLocalCosmos = (params: BondCosmosParams, hash: string) => {
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
                action: "bond",
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

    const saveLocalEvm = (params: BondEvmParams, hash: string) => {
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
                action: "bond",
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
        bondCosmos,
        bondEvm,
        statusOperation,
        statusPrepare
    }
}