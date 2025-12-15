import { AssetList, Chain } from '@chain-registry/types';
import { GasPrice } from '@cosmjs/stargate';
import { SignerOptions } from '@cosmos-kit/core';
import { assets, chains } from "chain-registry";

const COSMOS_CHAINS = {
    // Mainnet
    babylon: { id: 'bbn-1', name: 'babylon' },
    osmosis: { id: 'osmosis-1', name: 'osmosis' },

    // Testnet
    babylontestnet: { id: 'bbn-test-5', name: 'babylontestnet' },
} as const;

type CosmosChainKey = keyof typeof COSMOS_CHAINS;
export const PRIMARY_CHAIN = COSMOS_CHAINS.babylon;

// --- Derived metadata ---
const getChain = (id: string) => chains.find(c => c.chain_id === id);
const getAssets = (name: string) => assets.find(a => a.chain_name === name);

// Create lookup for all defined chains
export const COSMOS_CHAIN_INFO = Object.entries(COSMOS_CHAINS).reduce(
    (acc, [key, { id }]) => {
        const chain = getChain(id)!;
        const asset = getAssets(chain?.chain_name ?? '')!;
        acc[key as CosmosChainKey] = { chain, asset };
        return acc;
    },
    {} as Record<CosmosChainKey, { chain: Chain; asset: AssetList }>
);

// --- Export collections ---
export const COSMOS_KIT_CHAINS = Object.values(COSMOS_CHAIN_INFO)
    .map(v => v.chain)
    .filter((x): x is Chain => x !== undefined);

export const ASSETS: AssetList[] = Object.values(COSMOS_CHAIN_INFO)
    .map(v => v.asset)
    .filter((x): x is AssetList => x !== undefined);

export const CHAINS_NAME = Object.values(COSMOS_CHAINS).map(c => c.name);

// --- Dynamic signer options ---
export const SIGNER_OPTIONS: SignerOptions = {
    signingCosmwasm: (chain) => {
        // Narrow type: ensure it's an object, not a string
        if (typeof chain !== 'object' || !chain?.fees?.fee_tokens?.[0]) return {};

        const fee = chain.fees.fee_tokens[0];
        return {
            gasPrice: GasPrice.fromString(`${fee.average_gas_price}${fee.denom}`)
        };
    },
};