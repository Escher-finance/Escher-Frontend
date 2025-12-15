import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { COSMOS_CHAIN_INFO } from "@/configs/cosmos-chain";
import { CustomToken, LiquidStaking } from "@/types/chain";
import { Chain } from '@chain-registry/types';
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { fromBech32, toUtf8 } from '@cosmjs/encoding';
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { getSalt } from "./salt";
import { estimateFee, formatDecimal } from "./utils";

export const getExecuteContractMessage = (
    sender: string,
    contract_addr: string,
    msg: Record<string, unknown>,
    funds: {
        amount: string;
        denom: string | undefined;
    }[]
) => {
    return {
        typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
        value: MsgExecuteContract.fromPartial({
            sender,
            contract: contract_addr,
            msg: toUtf8(JSON.stringify(msg)),
            funds,
        })
    }
};

export const adjustAmount = async (params: {
    signingCosmWasmClient: SigningCosmWasmClient,
    userAddress: string,
    token: CustomToken,
    amount: string,
    lstContract: string,
    expected: number
}) => {
    const { amount, lstContract, signingCosmWasmClient, token, userAddress, expected } = params;

    let bondAmount = formatDecimal(Number(amount), token.decimals).toFixed(0);

    const funds = [{
        amount: bondAmount,
        denom: token.denom
    }];

    const msg = {
        bond: {
            salt: getSalt(),
            expected: expected.toString(),
        }
    };

    // get fee
    const estimatedFee = await estimateFee(
        signingCosmWasmClient,
        userAddress,
        lstContract,
        msg,
        funds,
        `${COSMOS_CHAIN_INFO.babylon.chain.fees?.fee_tokens[0].average_gas_price}${COSMOS_CHAIN_INFO.babylon.chain.fees?.fee_tokens[0].denom}`,
        1.7
    );

    const totalFunds = Number(bondAmount) + Number(estimatedFee.amount[0].amount);

    // bond 2, fee 3, balance = 4, total = 5
    if (Number(token.balance?.value) < totalFunds) {
        const newAmount = Number(bondAmount) - (totalFunds - Number(token.balance?.value));
        bondAmount = newAmount.toString();
    }

    return {
        bondAmount,
        estimatedFee
    };
}

export const getSourceChannelId = (lst: "babylon", sourceChainId: string | number): number | null => {
    switch (lst) {
        case "babylon":
            switch (sourceChainId) {
                case CHAINS.osmosis.id:
                    return 1;
            }
            break;
    }
    throw Error("getSourceChannelId: Unknown sourceChainId");
}

export const getDestinationChannelId = (lst: LiquidStaking, targetChainId: string | number): number | undefined => {
    switch (lst) {
        case "babylon":
            switch (targetChainId) {
                case CHAINS.babylon.id:
                    return undefined;

                case CHAINS.mainnet.id:
                    return 3;

                case CHAINS.osmosis.id:
                    return 4;
            }
            break;
    }
    throw Error("getDestinationChannelId: Unknown targetChainId");
}

export const _getIbcChannelId = (
    lst: "babylon",
    chainId: string | number
): {
    source: string | null
    destination: string | null
} => {
    switch (lst) {
        case "babylon":
            switch (chainId) {
                case CHAINS.babylon.id:
                    return {
                        source: null,
                        destination: null
                    }

                case CHAINS.osmosis.id:
                    return {
                        source: "channel-3",
                        destination: "channel-101635"
                    }
            }
    }
    throw Error("getSourceIbcChannelId: Unknown originChainId");
}

export const getIbcChannelId = (
    sourceChainId: string | number,
    destinationChainId: string | number
): {
    source: string | null
    destination: string | null
} => {
    switch (sourceChainId) {
        case CHAINS.babylon.id:
            switch (destinationChainId) {
                case CHAINS.osmosis.id:
                    return {
                        source: "channel-3",
                        destination: "channel-101635"
                    }
            }
            break;
        case CHAINS.osmosis.id:
            switch (destinationChainId) {
                case CHAINS.babylon.id:
                    return {
                        source: "channel-101635",
                        destination: "channel-3"
                    }
            }
            break;
    }
    return {
        source: null,
        destination: null
    }
}

export const getUcs03Contract = (
    lst: "babylon",
    chainId: string | number
): string => {
    switch (lst) {
        case "babylon":
            switch (chainId) {
                case CHAINS.babylon.id:
                    return BABYLON_CONTRACTS.ucs3Contract.babylon
                case CHAINS.osmosis.id:
                    return BABYLON_CONTRACTS.ucs3Contract.osmosis
            }
    }
    throw Error("getUcs03Contract: Unknown chainId");
}

export function isValidCosmosAddress(address: string, chain: Chain): boolean {
    try {
        const { prefix, data } = fromBech32(address)

        // Check prefix matches expected bech32 prefix
        const expectedPrefix = chain.bech32_prefix;
        if (prefix !== expectedPrefix) return false

        // Check data length (should be 20 bytes for Cosmos addresses)
        if (data.length !== 20) return false

        return true
    } catch {
        return false
    }
}

export function isValidEvmAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export async function fetchCosmosQuery(params: { lcd: string, contract: string, query: unknown }) {
    const encoded = Buffer.from(JSON.stringify(params.query)).toString('base64');
    const url = `${params.lcd.replace(/\/$/, '')}/cosmwasm/wasm/v1/contract/${params.contract}/smart/${encoded}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    return await response.json();
}

export const getExecuteAllowanceMsg = (contract: string, sender: string, spender: string, amount: string) => {
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

export const createSendIBCMsg = ({
    sender,
    denom,
    amount,
    sourceChannel,
    receiver,
    timeoutTimestamp,
    memo
}: {
    sender: string;
    denom: string;
    amount: string;
    sourceChannel: string | null;
    receiver: string;
    timeoutTimestamp: bigint;
    memo: string;
}) => {
    const typeUrl = "/ibc.applications.transfer.v1.MsgTransfer";
    return {
        typeUrl,
        value: {
            sourcePort: "transfer",
            sourceChannel,
            token: {
                amount,
                denom,
            },
            sender,
            receiver,
            timeoutTimestamp,
            memo,
        },
    };
};