import { ASSETS, COSMOS_KIT_CHAINS, SIGNER_OPTIONS } from "@/configs/cosmos-chain";
import { wallets as walletKeplr } from '@cosmos-kit/keplr-extension';
import { wallets as walletLeap } from '@cosmos-kit/leap-extension';
import { wallets as walletOkx } from '@cosmos-kit/okxwallet-extension';
import { ChainProvider } from "@cosmos-kit/react";
import React, { ReactNode } from "react";

export const COSMOSKIT_WALLET_STORAGE_NAME = [
    "keplr-extension",
    "leap-extension",
    "okxwallet-extension",
]

const CosmosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ChainProvider
            chains={COSMOS_KIT_CHAINS}
            assetLists={ASSETS}
            signerOptions={SIGNER_OPTIONS}
            wallets={[
                ...walletKeplr,
                ...walletLeap,
                ...walletOkx
            ]}
            sessionOptions={{ duration: 100 * 24 * 60 * 60 * 1000 }}
            throwErrors={false}
        >
            {children}
        </ChainProvider>
    );
}

export default CosmosProvider;