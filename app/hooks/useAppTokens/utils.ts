import { EMV_CHAINS } from "@/configs/wagmi";
import { CustomToken } from "@/types/chain";
import { ChainContext } from "@cosmos-kit/core";
import { createPublicClient, erc20Abi, formatUnits, http } from "viem";

export const getEvmChain = (chainId: number) => {
    const chain = EMV_CHAINS.get(chainId as 1 | 17000 | 11155111);
    return chain;
}

export const getEvmClient = (chainId: number) => {
    const chain = getEvmChain(chainId);
    if (!chain) return undefined;

    return createPublicClient({ chain: chain.chain, transport: http(chain.rpc) });
};

export const getEvmBalances = async (tokens: CustomToken[], address?: `0x${string}`): Promise<CustomToken[]> => {
    const byChain = tokens.reduce((acc, token) => {
        if (!token.contractAddress) return acc;
        const chainId = Number(token.chain.id);
        if (!acc[chainId]) acc[chainId] = [];
        acc[chainId].push(token);
        return acc;
    }, {} as Record<number, CustomToken[]>);

    const results: CustomToken[] = [];

    for (const chainId of Object.keys(byChain)) {
        const tokensOnChain = byChain[Number(chainId)];
        const client = getEvmClient(Number(chainId));
        if (!client) continue;

        const multicallContracts = tokensOnChain.map((token) => ({
            address: token.contractAddress!,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [address!],
        }));

        const multicallResult = await client.multicall({ contracts: multicallContracts });

        for (let i = 0; i < tokensOnChain.length; i++) {
            const token = tokensOnChain[i];
            const result = multicallResult[i];
            if (result.status === "success" && result.result !== undefined) {
                results.push({
                    ...token,
                    balance: {
                        decimals: token.decimals,
                        symbol: token.symbol,
                        value: result.result,
                        formattedBalance: formatUnits(result.result, token.decimals),
                    },
                });
            } else {
                results.push(token);
            }
        }
    }

    return results;
};

export const getEvmSupplies = async (tokens: CustomToken[]): Promise<CustomToken[]> => {
    const byChain = tokens.reduce((acc, token) => {
        if (!token.contractAddress) return acc;
        const chainId = Number(token.chain.id);
        if (!acc[chainId]) acc[chainId] = [];
        acc[chainId].push(token);
        return acc;
    }, {} as Record<number, CustomToken[]>);

    const results: CustomToken[] = [];

    for (const chainId of Object.keys(byChain)) {
        const tokensOnChain = byChain[Number(chainId)];
        const client = getEvmClient(Number(chainId));
        if (!client) continue;

        const multicallContracts = tokensOnChain.map((token) => ({
            address: token.contractAddress!,
            abi: erc20Abi,
            functionName: "totalSupply" as const,
            args: [],
        }));

        const multicallResult = await client.multicall({ contracts: multicallContracts });

        for (let i = 0; i < tokensOnChain.length; i++) {
            const token = tokensOnChain[i];
            const result = multicallResult[i];
            if (result.status === "success" && result.result !== undefined) {
                results.push({
                    ...token,
                    totalSupply: Number(result.result),
                });
            } else {
                results.push(token);
            }
        }
    }

    return results;
};

// Balance
export const getNativeBalance = async (token: CustomToken, address?: `0x${string}`): Promise<CustomToken> => {
    if (!address) return token;
    try {
        const client = getEvmClient(Number(token.chain.id));
        if (!client) return token;

        const balance = await client.getBalance({ address });
        return {
            ...token,
            balance: {
                decimals: token.decimals,
                symbol: token.chain.nativeCurrency.symbol,
                value: balance,
                formattedBalance: formatUnits(balance, token.decimals),
            },
        };
    } catch {
        return token;
    }
};

export const getCosmosBalance = async (token: CustomToken, cosmosChains: Record<string, ChainContext>): Promise<CustomToken> => {
    const ctx = cosmosChains[token.chain.chainName!];
    if (!ctx?.address || !ctx?.getCosmWasmClient || !token.denom) return token;

    // DEBUG
    // const address = "bbn10rktvmllvgctcmhl5vv8kl3mdksukyqf2tdveh8drpn0sppugwwq2wykr0";
    const address = ctx?.address;

    try {
        const client = await ctx.getCosmWasmClient();
        if (!token.isCw20) {
            const balance = await client.getBalance(address, token.denom);
            return {
                ...token,
                balance: {
                    decimals: token.decimals,
                    symbol: token.symbol,
                    value: BigInt(balance.amount),
                    formattedBalance: formatUnits(BigInt(balance.amount), token.decimals),
                },
            };
        } else {
            const balance = await client.queryContractSmart(token.denom, {
                balance: { address: address },
            });
            return {
                ...token,
                balance: {
                    decimals: token.decimals,
                    symbol: token.symbol,
                    value: BigInt(balance.balance ?? 0),
                    formattedBalance: formatUnits(BigInt(balance.balance ?? 0), token.decimals),
                },
            };
        }
    } catch {
        return token;
    }
};

export const getCosmosSupply = async (token: CustomToken, cosmosChains: Record<string, ChainContext>): Promise<CustomToken> => {
    const ctx = cosmosChains[token.chain.chainName!];
    const restEndpoint = token.chain?.rest;

    if (!ctx || !token.denom) return token;

    try {
        if (!token.isCw20) {
            if (!restEndpoint) return token;

            const querySupply = await fetch(`${restEndpoint}/cosmos/bank/v1beta1/supply`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const json = await querySupply.json();
            const matched = json.supply?.find((v: { denom: string; amount: string }) => v.denom === token.denom);
            const total = matched ? BigInt(matched.amount) : 0;

            return {
                ...token,
                totalSupply: Number(total),
            };
        } else {
            const client = await ctx.getCosmWasmClient();
            const info = await client.queryContractSmart(token.denom, { token_info: {} });

            return {
                ...token,
                totalSupply: Number(info.total_supply),
            };
        }
    } catch {
        return token;
    }
};

export function mergeTokenData(balanceToken: CustomToken, supplyToken: CustomToken | undefined): CustomToken {
    return {
        ...balanceToken,
        totalSupply: supplyToken?.totalSupply ?? balanceToken.totalSupply,
    };
}