import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { BABY_TOKENS } from "@/configs/token";
import { formatDecimal, getTokensByNetwork } from "@/lib/utils";
import { CustomToken, TokenBalance } from "@/types/chain";
import { useQuery } from "@tanstack/react-query";
import { Percent, Token, TradeType } from "@uniswap/sdk-core";
import {
    AlphaRouter,
    CurrencyAmount,
    SwapOptionsSwapRouter02,
    SwapRoute,
    SwapType
} from "@uniswap/smart-order-router";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Address, zeroAddress } from "viem";
import { useConnection } from "wagmi";
import { useMoralisBalance } from "./useMoralisBalance";

const TOKENS = getTokensByNetwork();

interface UniswapToken {
    address: Address
    chainId: number
    decimals: number
    isNative?: boolean
    logoURI: string
    name: string
    symbol: string
}

interface UniswapTokensResponse {
    logoURI: string;
    tokens: UniswapToken[];
}

const rpcEndpoint = "https://rpc.ankr.com/eth/6ca51a7c651832666dec082ba06f960038f88262804709ac6a0da81ca5eb20e3";
export const BABY_FEE = 20;
const BABY_TOKEN = TOKENS.find(v => v.contractAddress === "0xe53dCec07d16D88e386AE0710E86d9a400f83c31");
export const UNISWAP_BABY_TOKEN = makeToken(BABY_TOKEN);

const UNISWAP_WETH_TOKEN: UniswapToken = {
    chainId: 1,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
};

const UNISWAP_BABY_TOKEN_RESP: UniswapToken = {
    chainId: 1,
    address: "0xe53dCec07d16D88e386AE0710E86d9a400f83c31",
    name: "Babylon",
    symbol: "BABY",
    decimals: 6,
    logoURI: BABY_TOKEN?.icon ?? ""
};

const UNISWAP_ETH_TOKEN: UniswapToken = {
    chainId: 1,
    address: zeroAddress,
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    logoURI: UNISWAP_WETH_TOKEN.logoURI,
    isNative: true
};

function unshiftToken(tokens: UniswapToken[], symbol: string) {
    let index = -1;
    const token = tokens.find((t, i) => {
        const found = t.symbol === symbol;
        if (found) index = i;
        return found;
    });
    if (token) {
        tokens.splice(index, 1);
        tokens.unshift(token);
    }
}

export function unshiftCustomToken(tokens: CustomToken[], symbol: string) {
    let index = -1;
    const token = tokens.find((t, i) => {
        const found = t.symbol === symbol;
        if (found) index = i;
        return found;
    });
    if (token) {
        tokens.splice(index, 1);
        tokens.unshift(token);
    }
}

export function makeToken(token: CustomToken | undefined): Token | undefined {
    if (!token?.contractAddress) return undefined;

    return new Token(
        Number(token.chain.id),
        token.contractAddress,
        token.decimals,
        token.symbol,
        token.name
    );
}

export function makeTokenFromUniswapToken(uniswapToken: UniswapToken): Token {
    return new Token(
        uniswapToken.chainId,
        uniswapToken.address,
        uniswapToken.decimals,
        uniswapToken.symbol,
        uniswapToken.name
    );
}

// TOKEN
export async function fetchUniswapTokens() {
    const response = await fetch("https://tokens.uniswap.org");
    const data: UniswapTokensResponse = await response.json();

    // We only care about mainnet for now
    const filteredTokens = data.tokens.filter(
        (t) => t.chainId === 1 && t.symbol !== "eBABY" && t.symbol !== "BABY"
    );

    unshiftToken(filteredTokens, "USDT");
    unshiftToken(filteredTokens, "USDC");
    unshiftToken(filteredTokens, "WETH");

    filteredTokens.unshift(UNISWAP_ETH_TOKEN);
    filteredTokens.unshift(UNISWAP_BABY_TOKEN_RESP);

    const result: CustomToken[] = [];
    filteredTokens.map(v => {
        result.push(
            {
                chain: CHAINS.mainnet,
                decimals: v.decimals,
                icon: v.logoURI,
                id: `${v.chainId}${v.address ? `_${v.address}` : ""}`,
                contractAddress: v.address,
                isBridgeAble: false,
                isLiquid: false,
                isNative: v.isNative ?? false,
                isStakeAble: true,
                isPosition: false,
                isUniswap: true,
                name: v.name,
                symbol: v.symbol,
            });
    });

    return result;
}

export const useUniswapTokens = () => {
    const { address: evmAddress } = useConnection();
    const moralisBalance = useMoralisBalance(evmAddress);
    // test address "0xcB1C1FdE09f811B294172696404e88E658659905"

    const { data: uniswapTokens, ...rest } = useQuery({
        queryKey: ['uniswapTokens'],
        queryFn: fetchUniswapTokens,
        refetchInterval: APP_CONFIG.longRefetchInterval,
        staleTime: APP_CONFIG.longRefetchInterval,
        refetchOnWindowFocus: false,
        enabled: APP_CONFIG.enableEvm
    });

    const data = useMemo((): CustomToken[] | undefined => {
        if (!uniswapTokens) return undefined;
        if (!moralisBalance?.data) return uniswapTokens;

        const result = uniswapTokens.map(token => {
            let searchTokenAddress = token.contractAddress;
            if (searchTokenAddress === zeroAddress) {
                searchTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
            }

            const balance = moralisBalance.data.find(v => v.token_address.toLowerCase() === searchTokenAddress?.toLowerCase());
            if (!balance) return token;

            const newBalance: TokenBalance = {
                decimals: token.decimals,
                formattedBalance: formatDecimal(Number(balance.balance), -token.decimals).toString(),
                symbol: token.symbol,
                value: BigInt(Number(balance.balance)),
                dollarPerToken: balance.usd_price,
                dollarValue: balance.usd_value
            }
            return {
                ...token,
                balance: newBalance
            }
        });

        unshiftCustomToken(result, "ETH");
        unshiftCustomToken(result, "USDC");
        unshiftCustomToken(result, "USDT");
        unshiftCustomToken(result, "WETH");

        return result;
    }, [moralisBalance.data, uniswapTokens]);

    return {
        data,
        refetch: () => {
            rest.refetch();
            moralisBalance.refetch();
        },
        moralisData: moralisBalance.data,
        rest
    }
};

// ROUTE
interface UniswapRouteParameters {
    amount?: string
    inputToken?: CustomToken
    outputToken?: CustomToken
    slippage: string
    tradeType?: TradeType
    userAddress?: Address
    forceSwap?: boolean
}

export async function getUniswapRoute({
    inputToken,
    outputToken,
    amount,
    slippage,
    userAddress,
    tradeType
}: UniswapRouteParameters): Promise<SwapRoute> {
    if (!inputToken) {
        throw 'Invalid input token';
    }

    if (!outputToken) {
        throw 'Invalid output token';
    }

    if (!UNISWAP_BABY_TOKEN) {
        throw 'Invalid baby token';
    }

    if (!userAddress) {
        throw 'Invalid address';
    }

    console.log({
        inputToken,
        outputToken,
        amount,
        slippage,
        userAddress,
        tradeType
    });


    const uniswapInputToken = inputToken.contractAddress === zeroAddress ?
        makeTokenFromUniswapToken(UNISWAP_WETH_TOKEN)
        : makeToken(inputToken);
    if (!uniswapInputToken) {
        throw 'Invalid input token';
    }

    const uniswapOutputToken = outputToken.contractAddress === zeroAddress ?
        makeTokenFromUniswapToken(UNISWAP_WETH_TOKEN)
        : makeToken(outputToken);
    if (!uniswapOutputToken) {
        throw 'Invalid output token';
    }

    const isExactOutput = tradeType === TradeType.EXACT_OUTPUT;

    const parsedAmount = BigInt(formatDecimal(Number(amount), isExactOutput ? uniswapOutputToken.decimals : uniswapInputToken.decimals));
    const parsedSlippage = new Percent(Number(slippage) * 100, 10_000);

    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    const router = new AlphaRouter({
        chainId: 1,
        provider
    });
    const options: SwapOptionsSwapRouter02 = {
        recipient: userAddress,
        slippageTolerance: parsedSlippage,
        deadline: Math.floor((Date.now() / 1000) + (60 * 30)),
        type: SwapType.SWAP_ROUTER_02
    };

    const route = await router.route(
        CurrencyAmount.fromRawAmount(isExactOutput ? uniswapOutputToken : uniswapInputToken, parsedAmount.toString()),
        isExactOutput ? uniswapInputToken : uniswapOutputToken,
        tradeType ?? TradeType.EXACT_INPUT,
        options
    );

    if (route === null || route.methodParameters === undefined) {
        throw Error("Could not find route");
    }

    return route;
}

export const useUniswapRoute = (params: UniswapRouteParameters) => {
    const [debouncedParams, setDebouncedParams] = useState<UniswapRouteParameters>(params);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedParams(params);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [
        params
    ]);

    return useQuery({
        queryKey: [
            'uniswapRoutes',
            debouncedParams.inputToken?.contractAddress,
            debouncedParams.outputToken?.contractAddress,
            debouncedParams.amount,
            debouncedParams.slippage,
            debouncedParams.userAddress
        ],
        queryFn: () => getUniswapRoute(debouncedParams),
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        refetchOnWindowFocus: false,
        enabled:
            // false &&
            APP_CONFIG.enableEvm &&
            debouncedParams.inputToken &&
            debouncedParams.outputToken &&
            debouncedParams.userAddress &&
            debouncedParams.userAddress !== '0x' &&
            Number(debouncedParams.amount ?? 0) > 0 &&
            (
                params.forceSwap ||
                (debouncedParams.inputToken?.isUniswap && debouncedParams.inputToken?.contractAddress !== UNISWAP_BABY_TOKEN?.address)
            )
    });
};

// FEE
interface UniswapFeeParameters {
    feeTokenIsBaby: boolean
    address: `0x${string}`
    feeToken?: CustomToken
}

export const useUniswapFee = (params: UniswapFeeParameters) => {
    const [debouncedParams, setDebouncedParams] = useState<UniswapFeeParameters>(params);

    const getData = async () => {
        try {
            if (!params.feeTokenIsBaby) {
                const _routeForFee = await getUniswapRoute({
                    userAddress: params.address,
                    inputToken: BABY_TOKENS.mainnet,
                    amount: BABY_FEE.toString(),
                    outputToken: params.feeToken,
                    slippage: "0.5"
                });
                return BigInt(_routeForFee.quote.numerator.toString());
            } else {
                return BigInt(formatDecimal(BABY_FEE, 6).toFixed(0));
            }
        } catch (error) {
            console.error(error);
            throw error
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedParams(params);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [params]);

    return useQuery({
        queryKey: [
            'uniswapFee',
            debouncedParams.address,
            debouncedParams.feeToken?.symbol,
            debouncedParams.feeTokenIsBaby,
        ],
        queryFn: getData,
        refetchInterval: APP_CONFIG.longRefetchInterval,
        refetchOnWindowFocus: false,
        enabled:
            // false &&
            APP_CONFIG.enableEvm &&
            APP_CONFIG.enableEvm &&
            debouncedParams.address &&
            (debouncedParams.feeToken !== undefined)
    });

}
