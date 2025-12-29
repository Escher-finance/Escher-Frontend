'use client';

import { CHAINS_NAME } from '@/configs/cosmos-chain';
import { wagmiConfig } from '@/configs/wagmi';
import { useAppTokens } from '@/hooks/useAppTokens/useAppTokens';
import { CustomToken } from '@/types/chain';
import { ChainContext } from '@cosmos-kit/core';
import { useChains } from '@cosmos-kit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useConnection, useDisconnect, WagmiProvider } from 'wagmi';
import Intro from '../global/intro';
import CosmosProvider from './cosmosProvider';
import { useSafeAutoConnect } from '@/hooks/useSafeAutoConnect';

interface AccountCosmos {
    address: {
        babylon: string
        osmosis?: string
    }
    disconnect(): void
    isConnected: boolean
    chainContext?: {
        babylon: ChainContext
        osmosis?: ChainContext
    }
}

interface AccountEvm {
    address: string | `0x${string}`
    disconnect(): void
    isConnected: boolean
    chainContext?: ChainContext
}

export interface EscherTokens {
    evm: {
        baby: CustomToken;
        ebaby: CustomToken;
        u: CustomToken;
        eU: CustomToken;
    };
    babylon: {
        baby: CustomToken;
        ebaby: CustomToken;
    };
    osmosis: {
        baby: CustomToken;
        ebaby: CustomToken;
    };
}

export interface EscherAccount {
    cosmos: AccountCosmos | undefined
    evm: AccountEvm | undefined
}

interface EscherContextType {
    account: EscherAccount
    escherTokens: EscherTokens
    isTokenBalanceFetched: boolean
    openAccountSidebar: boolean
    openWalletConnection: boolean
    refetchTokens: () => void
    setOpenAccountSidebar(val: boolean): void
    setOpenWalletConnection(val: boolean): void
    tokens: CustomToken[]

    timestampTransaction: number
    updateTimestampTransaction(): void
}

interface EscherProviderProps {
    children: ReactNode;
}

const EscherContext = createContext<EscherContextType | undefined>(undefined);
const queryClient = new QueryClient();

const AppProvider: React.FC<EscherProviderProps> = ({ children }) => {
    // Sidebar
    const [openAccountSidebar, setOpenAccountSidebar] = useState(false);

    // Wallet
    const [openWalletConnection, setOpenWalletConnection] = useState(false);

    // Account
    const cosmosChains = useChains(CHAINS_NAME);
    const { address: evmAddress, isConnected: isEvmConnected } = useConnection();
    const { mutate: evmDisconnect } = useDisconnect();
    useSafeAutoConnect();

    const account: EscherAccount = useMemo(() => {
        return {
            cosmos: cosmosChains.babylon.address ? {
                address: {
                    babylon: cosmosChains.babylon.address,
                    osmosis: cosmosChains.osmosis.address
                },
                disconnect: cosmosChains.babylon.disconnect,
                isConnected: cosmosChains.babylon.isWalletConnected,
                chainContext: {
                    babylon: cosmosChains.babylon,
                    osmosis: cosmosChains.osmosis
                }
            } : undefined,

            evm: (isEvmConnected && evmAddress) ? {
                address: evmAddress,
                disconnect: evmDisconnect,
                isConnected: isEvmConnected
            } : undefined
        }
    }, [cosmosChains, isEvmConnected, evmAddress, evmDisconnect]);

    // Tokens
    const { data: tokens, escherTokens, refetch: refetchTokens, isFetched: isTokenBalanceFetched } = useAppTokens();

    // Timestapms
    const [timestampTransaction, setTimestampTransaction] = useState(0);

    // Dummy loading
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAuthChecked(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, []);

    if (!isAuthChecked) {
        return (
            <Intro />
        );
    }

    return (
        <EscherContext.Provider value={{
            account,
            escherTokens,
            isTokenBalanceFetched,
            openAccountSidebar,
            openWalletConnection,
            refetchTokens,
            setOpenAccountSidebar,
            setOpenWalletConnection,
            tokens,
            timestampTransaction,
            updateTimestampTransaction: () => setTimestampTransaction(prev => prev + 1)
        }}>
            {children}
        </EscherContext.Provider>
    );
};

export const EscherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <CosmosProvider>
                    <AppProvider>
                        {children}
                    </AppProvider>
                </CosmosProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export const useEscher = () => {
    const context = useContext(EscherContext);

    if (!context) {
        throw new Error('useEscher must be used within a EscherProvider');
    }

    return context;
};
