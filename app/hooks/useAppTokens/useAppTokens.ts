import { EscherTokens } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import { CHAINS_NAME } from "@/configs/cosmos-chain";
import { BABY_TOKENS, EBABY_TOKENS, EU_TOKENS, U_TOKENS } from "@/configs/token";
import { formatDecimal, getTokensByNetwork } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { useChains } from "@cosmos-kit/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { formatUnits } from "viem";
import { useConnection } from "wagmi";
import { useUnionExchangeRate } from "../liquidStakingContract/union/rate";
import useBabylonLiquidity from "../useBabylonLiquidity";
import useCoingeckoPrice from "../useCoingeckoPrice";
import {
    getCosmosBalance,
    getCosmosSupply,
    getEvmBalances,
    getEvmSupplies,
    getNativeBalance
} from "./utils";

// --------------------------------------------------
// Base tokens for all supported networks
// --------------------------------------------------
const TOKENS = getTokensByNetwork();

/**
 * Main hook: useAppTokens
 *
 * Fetches, merges, and enriches token data (balances, supplies, prices, and TVL)
 * from multiple networks (EVM + Cosmos) and provides a unified dataset for the app.
 */
export function useAppTokens() {
    const queryClient = useQueryClient();
    const { address: evmAddress, chain: evmChain } = useConnection();
    const cosmosChains = useChains(CHAINS_NAME);

    // External queries
    const { data: coingeckoData } = useCoingeckoPrice(TOKENS.filter(t => t.isBalanceWatch));
    const { queryLiquidity: queryBabylonExchangeRate } = useBabylonLiquidity();
    const queryUnionExchangeRate = useUnionExchangeRate();

    // --------------------------------------------------
    // Token classification by network type
    // --------------------------------------------------
    const nativeEvmTokens = TOKENS.filter(t => t.chain.network === "evm" && t.isNative);
    const evmTokens = TOKENS.filter(t => t.chain.network === "evm" && !t.isNative);
    const cosmosTokens = TOKENS.filter(t => t.chain.network === "cosmos");

    // Map of Cosmos tokens that should be balance-watched
    const watchCosmosMap = useMemo(() => new Map(
        TOKENS.filter(t => t.isBalanceWatch && t.denom !== undefined).map(t => [t.denom, true])
    ), []);

    // Combine EVM + all Cosmos chain addresses for query keys and balance fetch
    const chainsAddress = useMemo(() => {
        return [
            evmAddress,
            ...Object.values(cosmosChains).map((c) => c.address).filter(Boolean),
        ];
    }, [evmAddress, cosmosChains]);

    // --------------------------------------------------
    // Core function: Fetch balances + total supplies
    // --------------------------------------------------
    const fetchBalanceData = useCallback(async () => {
        /**
         * Helper: updatePartial
         * Incrementally updates cached token data in React Query
         * Used for progressive hydration — avoids flicker between fetches
         */
        const updatePartial = (newTokens: CustomToken[]) => {
            queryClient.setQueryData(["appTokens", ...chainsAddress], (oldData: CustomToken[] | undefined) => {
                const prev = oldData ?? TOKENS;
                const map = new Map(prev.map(t => [t.id, t]));

                newTokens.forEach(t => {
                    const existing = map.get(t.id);

                    if (!existing) {
                        map.set(t.id, t);
                        return;
                    }

                    // Merge token updates without losing existing data
                    const merged = {
                        ...existing,
                        ...t,
                        balance: t.balance ?? existing.balance,
                        totalSupply: t.totalSupply ?? existing.totalSupply,
                    };

                    map.set(t.id, merged);
                });

                return Array.from(map.values());
            });
        };

        // -----------------------------
        // EVM: Native & ERC20 balances
        // -----------------------------
        const evmFetch = (async () => {
            const [nativeEvmBalances, evmBalanceTokens] = await Promise.all([
                Promise.allSettled(nativeEvmTokens.map(t => getNativeBalance(t, evmAddress))),
                getEvmBalances(evmTokens.filter(t => t.isBalanceWatch), evmAddress),
            ]);

            const fulfilledNative = nativeEvmBalances
                .map(r => (r.status === "fulfilled" ? r.value : undefined))
                .filter(Boolean) as CustomToken[];

            const evmData = [...fulfilledNative, ...evmBalanceTokens];
            updatePartial(evmData);
            return evmData;
        })();

        // -----------------------------
        // COSMOS: Balances
        // -----------------------------
        const cosmosFetch = (async () => {
            const cosmosBalanceResults = await Promise.allSettled(
                cosmosTokens.map(t =>
                    watchCosmosMap.has(t.denom!)
                        ? getCosmosBalance(t, cosmosChains)
                        : Promise.resolve(t)
                )
            );

            const fulfilledCosmos = cosmosBalanceResults
                .map(r => (r.status === "fulfilled" ? r.value : undefined))
                .filter(Boolean) as CustomToken[];

            updatePartial(fulfilledCosmos);
            return fulfilledCosmos;
        })();

        // -----------------------------
        // EVM: Total Supply
        // -----------------------------
        const evmSupplyFetch = (async () => {
            try {
                const evmSupplies = await getEvmSupplies(evmTokens.filter(t => t.isBalanceWatch));
                updatePartial(evmSupplies);
                return evmSupplies;
            } catch (e) {
                console.warn("EVM supply fetch failed:", e);
                return [];
            }
        })();

        // -----------------------------
        // COSMOS: Total Supply
        // -----------------------------
        const cosmosSupplyFetch = (async () => {
            const cosmosSuppliesSettled = await Promise.allSettled(
                cosmosTokens.map(t => getCosmosSupply(t, cosmosChains))
            );
            const cosmosSupplies = cosmosSuppliesSettled
                .map(r => (r.status === "fulfilled" ? r.value : undefined))
                .filter(Boolean) as CustomToken[];

            updatePartial(cosmosSupplies);
            return cosmosSupplies;
        })();

        // Wait for all parallel fetches
        await Promise.all([
            evmFetch,
            cosmosFetch,
            evmSupplyFetch,
            cosmosSupplyFetch,
        ]);

        // Return the latest cached data (avoids flicker)
        return queryClient.getQueryData<CustomToken[]>(["appTokens", ...chainsAddress]) ?? TOKENS;
    }, [queryClient, chainsAddress, nativeEvmTokens, evmTokens, evmAddress, cosmosTokens, watchCosmosMap, cosmosChains]);

    // --------------------------------------------------
    // Compute exchange rates for liquid staking tokens
    // --------------------------------------------------
    const exchangeRates = useMemo(() => ({
        babylon: queryBabylonExchangeRate.data?.exchange_rate,
        union: queryUnionExchangeRate.data?.redemption_rate,
    }), [queryBabylonExchangeRate.data, queryUnionExchangeRate.data]);

    // --------------------------------------------------
    // React Query: Unified token state (auto refetched)
    // --------------------------------------------------
    const { data: balanceData = TOKENS, refetch, isFetched } = useQuery({
        queryKey: ["appTokens", ...chainsAddress],
        queryFn: fetchBalanceData,
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
    });

    // --------------------------------------------------
    // Enrich tokens with Coingecko price + TVL + USD values
    // --------------------------------------------------
    const data: CustomToken[] = useMemo(() => {
        if (!balanceData) return [];

        try {
            return balanceData.map((token) => {
                const gecko = coingeckoData?.find((g) => g.id === token.coingeckoId);
                const price = gecko?.price ?? 0;

                // Determine exchange rate (if token is liquid staking)
                let exchangeRate = 1;
                if (token.isLiquid && token.lst) {
                    if (token.lst.includes("babylon"))
                        exchangeRate = Number(exchangeRates.babylon ?? 1);
                    else if (token.lst.includes("union"))
                        exchangeRate = Number(exchangeRates.union ?? 1);
                }

                const finalPrice = price * exchangeRate;

                // Compute TVL
                const tvl =
                    token.totalSupply && finalPrice
                        ? formatDecimal(token.totalSupply, -token.decimals) * finalPrice
                        : undefined;

                // Compute balance's USD value
                const balance =
                    token.balance && finalPrice
                        ? {
                            ...token.balance,
                            dollarPerToken: finalPrice,
                            dollarValue:
                                Number(formatUnits(BigInt(token.balance.value), token.decimals)) *
                                finalPrice,
                        }
                        : token.balance;

                return {
                    ...token,
                    tvl,
                    balance,
                    coingeckoPrice: finalPrice || undefined,
                };
            });
        } catch (error) {
            console.error("Error computing token data:", error);
            return balanceData;
        }
    }, [balanceData, coingeckoData, exchangeRates]);

    // --------------------------------------------------
    // Map EscherTokens (structured token grouping for UI)
    // --------------------------------------------------
    const escherTokens = useMemo((): EscherTokens => ({
        evm: {
            baby: data.find(t => t.id === BABY_TOKENS.mainnet.id)!,
            ebaby: data.find(t => t.id === EBABY_TOKENS.mainnet.id)!,
            u: data.find(t => t.id === U_TOKENS.mainnet.id)!,
            eU: data.find(t => t.id === EU_TOKENS.mainnet.id)!,
        },
        babylon: {
            baby: data.find(t => t.id === BABY_TOKENS.babylon.id)!,
            ebaby: data.find(t => t.id === EBABY_TOKENS.babylon.id)!,
        },
        osmosis: {
            baby: data.find(t => t.id === BABY_TOKENS.osmosis.id)!,
            ebaby: data.find(t => t.id === EBABY_TOKENS.osmosis.id)!,
        },
    }), [data]);

    // --------------------------------------------------
    // Extract the current EVM chain’s native token (ETH, etc.)
    // --------------------------------------------------
    const evmNativeToken = useMemo(() => {
        return data.find((v) => v.chain.id === evmChain?.id && v.isNative);
    }, [data, evmChain]);

    // --------------------------------------------------
    // Return final structured data
    // --------------------------------------------------
    return { data, escherTokens, evmNativeToken, refetch, isFetched };
}
